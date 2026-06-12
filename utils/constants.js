// ── 常量配置 ──────────────────────────────────────────────

/** 猫咪品种列表 */
const BREEDS = [
  '白猫', '橘猫', '黑猫', '长毛白猫', '长毛黑猫',
  '狸花猫', '奶牛猫', '三花猫', '玳瑁猫', '灰猫',
  '暹罗猫', '英短', '美短', '布偶猫', '其他',
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
  { key: 'seasoning', label: '调味品' },
  { key: 'toxic_plant', label: '有毒植物' },
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

/** 品种→档案拼音编码（2-3位） */
const BREED_CODES = {
  '白猫': 'CB',
  '黑猫': 'CH',
  '灰猫': 'HM',
  '橘猫': 'JM',
  '三花猫': 'SH',
  '玳瑁猫': 'DM',
  '奶牛猫': 'NN',
  '狸花猫': 'LH',
  '暹罗猫': 'XL',
  '英短': 'YD',
  '美短': 'MD',
  '布偶猫': 'BO',
  '长毛白猫': 'CMB',
  '长毛黑猫': 'CMH',
  '其他': 'QT',
};

/**
 * 生成结构化档案编号
 * 格式：品种(2-3) + 地区代码(6) + 日期YYMMDD(6) + 随机(2)
 * 例：JM110101260612XK
 *
 * @param {string} breed - 品种名称（中文，需在 BREED_CODES 映射表中）
 * @param {string[]} regionCodes - 微信 picker mode="region" 返回的 code 数组 [省,市,区]
 * @param {string} dateStr - 日期字符串，如 "2026-06-12"，默认当天
 * @returns {string} 16-17位档案编号
 */
function generateArchiveCode(breed, regionCodes, dateStr) {
  // 品种编码（默认 QT 其他）
  const breedCode = BREED_CODES[breed] || 'QT';

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

  // 随机2位（大写字母+数字）
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rnd = '';
  for (let i = 0; i < 2; i++) {
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
