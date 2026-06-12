// ── 云函数: process-agreement ─────────────────────────────
// 领养协议回传 → 自动模糊处理 → 双文件存储
//
// 流程:
//   1. 接收协议扫描件 base64 或 fileID
//   2. 用 sharp.blur() 生成模糊副本（掩盖隐私信息）
//   3. 原文件 → Storage: agreements/originals/  (RLS: 仅救助人可读)
//   4. 模糊副本 → Storage: agreements/blurred/   (RLS: 双方可读)
//   5. 写入 adoption_agreements 表
//   6. 返回两条 URL
//
// 环境变量:
//   SUPABASE_URL, SUPABASE_SERVICE_KEY
// ══════════════════════════════════════════════════════════

const cloud = require('wx-server-sdk');
const fetch = require('node-fetch');
const sharp = require('sharp');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://d5msiv8g91huch72eu20.baseapi.memfiredb.com';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// ── 工具 ─────────────────────────────────────────────────

async function supabaseAdmin(method, path, body, contentType) {
  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  };
  if (body) {
    headers['Content-Type'] = contentType || 'application/json';
    if (typeof body === 'object' && !(body instanceof Buffer)) {
      body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${SUPABASE_URL}${path}`, { method, headers, body });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

/** 下载微信云文件 → Buffer */
async function downloadCloudFile(fileID) {
  const res = await cloud.downloadFile({ fileID });
  return res.fileContent; // Buffer
}

// ── 主函数 ───────────────────────────────────────────────

exports.main = async (event) => {
  const {
    cat_id,
    rescuer_user_id,
    image_base64,       // base64 编码的图片（优先使用）
    image_fileID,       // 微信云文件 ID（回退方案）
  } = event;

  if (!cat_id || !rescuer_user_id) {
    return { ok: false, error: 'missing cat_id or rescuer_user_id' };
  }
  if (!image_base64 && !image_fileID) {
    return { ok: false, error: 'missing image (base64 or fileID)' };
  }

  try {
    // ── 1. 获取图片 Buffer ──────────────────────────────
    let imageBuffer;

    if (image_base64) {
      imageBuffer = Buffer.from(image_base64, 'base64');
    } else {
      imageBuffer = await downloadCloudFile(image_fileID);
    }

    console.log(`image loaded: ${imageBuffer.length} bytes`);

    // ── 2. 生成模糊副本 ──────────────────────────────────
    // 模糊程度：强模糊以保护隐私，但仍可辨认有内容
    const blurredBuffer = await sharp(imageBuffer)
      .resize({ width: 800, withoutEnlargement: true })  // 统一宽度
      .blur(15)                                           // 强模糊
      .jpeg({ quality: 40 })                              // 压缩
      .toBuffer();

    console.log(`blurred: ${blurredBuffer.length} bytes`);

    // ── 3. 上传原文件 ───────────────────────────────────
    const ts = Date.now();
    const catPrefix = cat_id.slice(0, 8);
    const originalPath = `agreements/originals/${catPrefix}_${ts}_original.jpg`;

    await supabaseAdmin(
      'POST',
      `/storage/v1/object/${originalPath}`,
      imageBuffer,
      'image/jpeg'
    );
    const originalUrl = `${SUPABASE_URL}/storage/v1/object/${originalPath}`;

    // ── 4. 上传模糊副本 ──────────────────────────────────
    const blurredPath = `agreements/blurred/${catPrefix}_${ts}_blurred.jpg`;

    await supabaseAdmin(
      'POST',
      `/storage/v1/object/${blurredPath}`,
      blurredBuffer,
      'image/jpeg'
    );
    const blurredUrl = `${SUPABASE_URL}/storage/v1/object/${blurredPath}`;

    // ── 5. 写入 adoption_agreements 表 ──────────────────
    const record = await supabaseAdmin(
      'POST',
      '/rest/v1/adoption_agreements',
      {
        cat_id,
        rescuer_user_id,
        original_url: originalUrl,
        blurred_url: blurredUrl,
        status: 'pending',
      }
    );

    console.log(`agreement saved: ${catPrefix}, status=pending`);
    return {
      ok: true,
      id: record?.[0]?.id || record?.id,
      original_url: originalUrl,
      blurred_url: blurredUrl,
    };

  } catch (err) {
    console.error('process-agreement error:', err);
    return { ok: false, error: err.message || String(err) };
  }
};
