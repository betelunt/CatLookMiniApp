// ── 云函数: generate-wxacode ──────────────────────────────
// 生成分享用小程序码 → 上传到 Supabase Storage → 返回 URL
//
// 环境变量:
//   SUPABASE_URL, SUPABASE_SERVICE_KEY
// ══════════════════════════════════════════════════════════

const cloud = require('wx-server-sdk');
const fetch = require('node-fetch');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://d5msiv8g91huch72eu20.baseapi.memfiredb.com';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function supabaseAdmin(method, path, body, contentType) {
  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  };
  if (body) {
    headers['Content-Type'] = contentType || 'application/json';
  }
  const res = await fetch(`${SUPABASE_URL}${path}`, { method, headers, body });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

exports.main = async (event) => {
  const { cat_id } = event;
  if (!cat_id) {
    return { ok: false, error: 'missing cat_id' };
  }

  try {
    // ── 1. 调用微信 API 生成小程序码 ─────────────────────
    const wxacodeBuffer = await cloud.openapi.wxacode.getUnlimited({
      scene: `id=${cat_id}`,
      page: 'pages/adoption-detail/adoption-detail',
      width: 280,
      auto_color: false,
      line_color: { r: 255, g: 140, b: 66 },
    });

    console.log(`wxacode generated: ${wxacodeBuffer.buffer.length} bytes`);

    // ── 2. 上传到 Supabase Storage ───────────────────────
    const ts = Date.now();
    const catPrefix = cat_id.slice(0, 8);
    const storagePath = `qrcodes/${catPrefix}_${ts}.jpg`;

    await supabaseAdmin(
      'POST',
      `/storage/v1/object/${storagePath}`,
      wxacodeBuffer.buffer,
      'image/jpeg'
    );

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${storagePath}`;
    console.log(`uploaded: ${publicUrl}`);

    return { ok: true, url: publicUrl };

  } catch (err) {
    console.error('generate-wxacode error:', err);
    return { ok: false, error: err.message || String(err) };
  }
};
