// ── 云函数: ocr-ingredients ──────────────────────────────
// 接收图片 base64 → 微信 OCR 通用印刷体识别 → 解析配料名
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const { imageBase64 } = event;
  if (!imageBase64) {
    return { ok: false, error: 'missing imageBase64' };
  }

  try {
    // 1. 调用微信 OCR 开放接口（印刷体识别）
    const ocrRes = await cloud.openapi.ocr.printedText({
      type: 'photo',
      imgUrl: `data:image/jpeg;base64,${imageBase64}`,
    });

    console.log('OCR raw result:', JSON.stringify(ocrRes).slice(0, 500));

    // 2. 提取文字
    const items = ocrRes.items || [];
    const fullText = items.map(it => it.text).join('');

    // 3. 解析配料名
    const ingredients = parseIngredients(fullText);

    console.log(`Parsed ${ingredients.length} ingredients:`, ingredients.join(', '));
    return { ok: true, ingredients };
  } catch (e) {
    console.error('OCR error:', e);
    return { ok: false, error: e.message || 'OCR failed' };
  }
};

/**
 * 从 OCR 文字中解析配料名
 *
 * 典型配料表格式：
 *   "配料表：鸡肉、鸡肝、大米、玉米..."
 *   "原料组成：鸡肉粉(30%)、玉米、鸡油..."
 *   "成分：三文鱼、豌豆、..."
 */
function parseIngredients(text) {
  // 1. 定位配料表段落（找到"配料""原料""成分"关键词后的内容）
  const patterns = [
    /配料表?[：:]\s*(.+?)(?:。|保存|生产|保质|净含量|产品|营养|$)/,
    /原料[组成]?[：:]\s*(.+?)(?:。|添加剂|营养|保存|生产|保质|净含量|产品|$)/,
    /成分[：:]\s*(.+?)(?:。|营养|保存|生产|保质|净含量|产品|$)/,
  ];

  let ingredientBlock = '';
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1] && m[1].length > 3) {
      ingredientBlock = m[1];
      break;
    }
  }

  // 如果没找到明显段落标记，用全文
  if (!ingredientBlock) {
    ingredientBlock = text;
  }

  // 2. 按分隔符拆分
  // 中文配料表常见分隔符：、，, . 。· ；; （）()
  // 先去掉括号内的比例/说明，再拆分
  const cleaned = ingredientBlock
    .replace(/[（(][^）)]*[）)]/g, '')  // 去括号内容 (如 "鸡肉粉(30%)")
    .replace(/[0-9]+%/g, '')              // 去百分比
    .replace(/[0-9]+\.[0-9]+%/g, '');

  const parts = cleaned.split(/[、，,\.。·；;／/]+/);

  // 3. 清洗每个配料名
  const ingredients = parts
    .map(p => p.trim())
    .filter(p => {
      // 过滤太短/太长/明显不是配料的内容
      if (p.length < 2 || p.length > 15) return false;
      // 过滤纯数字/纯标点
      if (/^[0-9\s\.%\-,;:：]+$/.test(p)) return false;
      // 过滤非配料关键词
      const skipWords = /^(配料表|原料组成|成分|产品|净含量|保质期|生产日期|保存|注意事项)/;
      if (skipWords.test(p)) return false;
      return true;
    })
    .map(p => {
      // 去尾部的括号/多余的标点
      return p.replace(/[（(][^)）]*$/, '').replace(/[，,\.。·：:;；]$/, '').trim();
    })
    .filter(p => p.length >= 2);

  // 去重（保留顺序）
  return [...new Set(ingredients)];
}
