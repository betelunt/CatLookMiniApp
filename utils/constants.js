// ── 常量配置 ──────────────────────────────────────────────

/** 猫咪品种列表（与 App 端保持一致） */
const BREEDS = [
  '白猫', '黑猫', '橘猫', '狸花猫', '奶牛猫',
  '三花猫', '玳瑁猫', '狮子猫', '橘白猫',
  '其他田园猫', '其他品种猫',
];

/** 猫咪状态 */
const CAT_STATUS = ['健康', '生病', '受伤', '恢复中', '怀孕', '需要绝育'];

/** 猫咪状态对应颜色 */
const STATUS_COLORS = {
  '健康': '#4CAF50', '生病': '#F44336', '受伤': '#FF5722',
  '恢复中': '#FF9800', '怀孕': '#E91E63', '需要绝育': '#2196F3',
};

/** 领养状态 */
const ADOPTION_STATUS = ['none', 'seeking', 'adopted'];

/** 食物分类 */
const FOOD_CATEGORIES = [
  { key: 'meat', label: '肉类' },
  { key: 'organ', label: '内脏' },
  { key: 'seafood', label: '海鲜' },
  { key: 'vegetable', label: '蔬菜' },
  { key: 'fruit', label: '水果' },
  { key: 'grain', label: '谷物' },
  { key: 'dairy', label: '乳制品' },
  { key: 'other', label: '其他' },
];

/** 安全等级 */
const SAFETY_LEVELS = {
  safe: { label: '安全', color: 'tag-safe' },
  caution: { label: '谨慎', color: 'tag-caution' },
  danger: { label: '危险', color: 'tag-danger' },
};

/** 性别选项与颜色 */
const GENDER_OPTIONS = ['未知', '男孩', '女孩'];
const GENDER_VALUES = [null, 'male', 'female'];
const GENDER_COLORS = {
  'male': '#1976D2',
  'female': '#E91E63',
};
const GENDER_LABELS = {
  'male': '♂男孩',
  'female': '♀女孩',
};

/** 品种→档案拼音编码（2位，与 App 端一致） */
const BREED_CODES = {
  '白猫': 'CB',
  '黑猫': 'CH',
  '橘猫': 'JM',
  '狸花猫': 'LH',
  '奶牛猫': 'NN',
  '三花猫': 'SH',
  '玳瑁猫': 'DM',
  '狮子猫': 'SZ',
  '橘白猫': 'JB',
  '其他田园猫': 'TT',
  '其他品种猫': 'PP',
};

/**
 * 生成结构化档案编号
 * 格式：品种(2) + 地区代码(6) + 日期YYMMDD(6) + 随机(3)
 * 例：JM440106260612XK3
 *
 * @param {string} breed - 品种名称（中文，需在 BREED_CODES 映射表中）
 * @param {string[]} regionCodes - 微信 picker mode="region" 返回的 code 数组 [省,市,区]
 * @param {string} dateStr - 日期字符串，如 "2026-06-12"，默认当天
 * @returns {string} 17位档案编号
 */
function generateArchiveCode(breed, regionCodes, dateStr) {
  // 品种编码（默认 TT 其他田园猫）
  const breedCode = BREED_CODES[breed] || 'TT';

  // 地区代码：取区级 → 市级 → 省级，优先级递减
  const regionCode = (regionCodes && regionCodes.length === 3)
    ? (regionCodes[2] || regionCodes[1] || regionCodes[0] || '000000')
    : '000000';

  // 日期 YYMMDD
  const d = dateStr ? new Date(dateStr) : new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dateCode = `${yy}${mm}${dd}`;

  // 随机3位（大写字母+数字，36^3=46656种组合）
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rnd = '';
  for (let i = 0; i < 3; i++) {
    rnd += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${breedCode}${regionCode}${dateCode}${rnd}`;
}

module.exports = {
  BREEDS, CAT_STATUS, STATUS_COLORS, ADOPTION_STATUS,
  FOOD_CATEGORIES, SAFETY_LEVELS,
  GENDER_OPTIONS, GENDER_VALUES, GENDER_COLORS, GENDER_LABELS,
  BREED_CODES, generateArchiveCode,
};
