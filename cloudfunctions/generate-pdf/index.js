// ── 云函数: generate-pdf ──────────────────────────────────
// 生成领养协议 PDF 模板
//
// 流程:
//   1. 接收 cat_id → 从 Supabase 获取猫咪信息
//   2. 用 pdf-lib 生成 PDF（含猫咪信息 + 协议条款）
//   3. 上传到 Supabase Storage: documents/agreements/<cat_id>_<timestamp>.pdf
//   4. 返回 downloadUrl
//
// 环境变量:
//   SUPABASE_URL, SUPABASE_SERVICE_KEY
// ══════════════════════════════════════════════════════════

const cloud = require('wx-server-sdk');
const fetch = require('node-fetch');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://d5msiv8g91huch72eu20.baseapi.memfiredb.com';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// ── 工具 ─────────────────────────────────────────────────

async function supabaseAdmin(method, path, body) {
  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  };
  if (body && !(body instanceof Buffer)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  } else if (body instanceof Buffer) {
    headers['Content-Type'] = 'application/pdf';
  }

  const res = await fetch(`${SUPABASE_URL}${path}`, { method, headers, body });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// ── 协议条款文本 ─────────────────────────────────────────

const AGREEMENT_TERMS = `
猫咪领养协议

甲方（救助人/送养人）：_________
联系电话/微信：_________
身份证号：_________

乙方（领养人）：_________
联系电话/微信：_________
身份证号：_________

鉴于甲方救助了以下猫咪，现寻找合适的领养家庭，乙方自愿领养该猫咪。
双方经友好协商，达成以下协议：

第一条 领养猫咪信息
猫咪名称、品种、年龄、性别、毛色、是否绝育、性格描述等信息详见本协议附件或页眉。

第二条 领养条件
1. 乙方需年满18周岁，有独立经济能力和稳定住所。
2. 乙方需提供有效身份证件以供核验。
3. 若乙方为租房居住，需征得房东同意饲养宠物。

第三条 乙方的权利与义务
1. 科学喂养，提供充足的饮水与食物，保证猫咪健康。
2. 定期为猫咪接种疫苗、驱虫，适龄后须进行绝育手术。
3. 猫咪生病时应及时就医，不得以任何理由拖延或放弃治疗。
4. 不得遗弃、虐待或转送猫咪。如因特殊情况无法继续饲养，须第一时间通知甲方协商处理。
5. 保持与甲方的定期联系，接受甲方的回访（线上或线下）。

第四条 甲方的权利与义务
1. 如实告知猫咪的健康状况、性格习性等信息。
2. 在猫咪移交前完成基础体检与疫苗接种。
3. 有权在领养后进行回访，了解猫咪生活状况。
4. 若发现乙方违反协议条款，有权要求返还猫咪。

第五条 违约责任
1. 若乙方违反本协议任一条款，甲方有权解除本协议并要求返还猫咪。
2. 若因乙方过失造成猫咪伤亡，乙方需承担相应责任。

第六条 争议解决
本协议履行过程中发生争议，双方应友好协商；协商不成的，
可依法向人民法院提起诉讼。

第七条 其他
1. 本协议自双方签字之日起生效。
2. 本协议一式两份，甲乙双方各执一份，具有同等法律效力。

甲方签字：_________    日期：_________

乙方签字：_________    日期：_________
`;

// ── 主函数 ───────────────────────────────────────────────

exports.main = async (event) => {
  const { cat_id, rescuer_info, adopter_info } = event;
  if (!cat_id) {
    return { ok: false, error: 'missing cat_id' };
  }

  try {
    // ── 1. 获取猫咪信息 ──────────────────────────────────
    const cats = await supabaseAdmin(
      'GET',
      `/rest/v1/cats?id=eq.${encodeURIComponent(cat_id)}&select=*&limit=1`
    );
    const cat = cats?.[0];
    if (!cat) {
      return { ok: false, error: 'cat not found' };
    }

    // ── 2. 生成 PDF ─────────────────────────────────────
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    let y = height - 50;

    const writeLine = (text, size = 12, opts = {}) => {
      const f = opts.bold ? boldFont : font;
      const lineHeight = size * 1.5;
      page.drawText(text, {
        x: opts.center ? (width - f.widthOfTextAtSize(text, size)) / 2 : 50,
        y,
        size,
        font: f,
        color: opts.color || rgb(0, 0, 0),
      });
      y -= lineHeight;
      if (y < 50) {
        page = pdfDoc.addPage([595, 842]);
        y = height - 50;
      }
    };

    // 标题
    writeLine('猫咪领养协议', 22, { bold: true, center: true });
    y -= 10;

    // 猫咪信息表
    writeLine('── 猫咪信息 ──', 14, { bold: true });
    writeLine(`名称: ${cat.name || '___'}`, 12);
    writeLine(`品种: ${cat.breed || '___'}`, 12);
    writeLine(`年龄: ${cat.age || '___'}`, 12);
    writeLine(`性别: ${cat.gender || '___'}   是否绝育: ${cat.is_neutered ? '是' : '否'}`, 12);
    writeLine(`毛色特征: ${cat.appearance || '___'}`, 12);
    writeLine(`性格: ${cat.personality || '___'}`, 12);
    writeLine(`健康状况: ${cat.status || '___'}`, 12);
    y -= 10;

    // 救助人 / 领养人信息
    writeLine('── 双方信息 ──', 14, { bold: true });
    writeLine(`救助人: ${rescuer_info || '___'}`, 12);
    writeLine(`领养人: ${adopter_info || '___'}`, 12);
    y -= 10;

    // 条款
    writeLine('── 协议条款 ──', 14, { bold: true });
    y -= 5;

    const lines = AGREEMENT_TERMS.trim().split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line === '') {
        y -= 6;
        continue;
      }
      const isSectionHeader = /^第[一二三四五六七八九十]条/.test(line);
      writeLine(line, isSectionHeader ? 12 : 11, { bold: isSectionHeader });
    }

    const pdfBytes = await pdfDoc.save();

    // ── 3. 上传到 Storage ───────────────────────────────
    const filename = `agreement_${cat_id.slice(0, 8)}_${Date.now()}.pdf`;
    const storagePath = `agreements/originals/${filename}`;

    const uploadRes = await supabaseAdmin(
      'POST',
      `/storage/v1/object/${storagePath}`,
      Buffer.from(pdfBytes)
    );

    // ── 4. 获取公开 URL ──────────────────────────────────
    const downloadUrl = `${SUPABASE_URL}/storage/v1/object/public/${storagePath}`;

    console.log(`PDF generated: ${filename} (${pdfBytes.length} bytes)`);
    return {
      ok: true,
      downloadUrl,
      filename,
      size: pdfBytes.length,
    };

  } catch (err) {
    console.error('generate-pdf error:', err);
    return { ok: false, error: err.message || String(err) };
  }
};
