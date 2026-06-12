// ── 开发模式共享 Mock 数据 ────────────────────────────────
// DEV_MODE=true 时使用。种子数据 + 本地缓存的用户数据合并。
// 字段名与 Supabase 线上 cats 表一致

const STORAGE_KEY = 'dev_cats';

// ── 种子数据 ─────────────────────────────────────────────

const SEED_CATS = [
  { id:1,  name:'小花', breed:'橘猫',     city:'北京', health_status:'健康',   age:'2', is_neutered:true,  gender:'female', personality:'亲人、爱撒娇',     description:'橘色短毛，白色肚皮',       photo_url:'', adoption_status:'seeking', archive_code:'JM110000260301XK3', special_notes:'特别爱吃鸡肉冻干，对陌生人比较警惕，建议先让猫咪熟悉几天再接触', created_by:'00000000-0000-0000-0000-000000000001' },
  { id:2,  name:'小黑', breed:'黑猫',     city:'上海', health_status:'健康',   age:'1', is_neutered:false, gender:'male',   personality:'活泼好动',         description:'纯黑短毛，金色眼睛',         photo_url:'', adoption_status:'none',    archive_code:'CH310000260302A7B', created_by:'00000000-0000-0000-0000-000000000001' },
  { id:3,  name:'雪球', breed:'白猫',     city:'杭州', health_status:'恢复中', age:'3', is_neutered:true,  gender:'female', personality:'温柔安静',         description:'纯白长毛，蓝色眼睛',         photo_url:'', adoption_status:'adopted', archive_code:'CB330100260303B9C', created_by:'00000000-0000-0000-0000-000000000001' },
  { id:4,  name:'虎子', breed:'狸花猫',   city:'北京', health_status:'健康',   age:'1', is_neutered:false, gender:'male',   personality:'调皮捣蛋、爱跑酷', description:'灰黑色条纹，白手套',         photo_url:'', adoption_status:'seeking', archive_code:'LH110000260304C3D', created_by:'user_other' },
  { id:5,  name:'奶茶', breed:'三花猫',   city:'广州', health_status:'健康',   age:'2', is_neutered:true,  gender:'female', personality:'安静、有点胆小',   description:'白底橘黑斑块，粉色鼻头',     photo_url:'', adoption_status:'seeking', archive_code:'SH440100260305D8E', created_by:'user_other' },
  { id:6,  name:'团子', breed:'其他品种猫', city:'深圳', health_status:'需要绝育', age:'1', is_neutered:false, gender:'male', personality:'憨厚粘人',      description:'蓝灰色短毛，圆脸铜色眼睛',   photo_url:'', adoption_status:'seeking', archive_code:'PP440300260306E2F', created_by:'user_other' },
];

// ── 本地缓存读写 ─────────────────────────────────────────

function loadUserCats() {
  try { return wx.getStorageSync(STORAGE_KEY) || []; }
  catch (e) { return []; }
}

function saveUserCats(cats) {
  wx.setStorageSync(STORAGE_KEY, cats);
}

/** 合并全部猫咪：种子 + 用户，用户修改过的覆盖种子 */
function getAllCats() {
  const userCats = loadUserCats();
  const userIds = new Set(userCats.map(c => String(c.id)));
  // 种子猫中，没有被用户修改过的才保留
  const seeds = SEED_CATS.filter(c => !userIds.has(String(c.id)));
  return [...seeds, ...userCats];
}

/** 我的猫咪 */
function getMyCats() {
  const userId = getApp().globalData.userId || '00000000-0000-0000-0000-000000000001';
  return getAllCats().filter(c => c.created_by === userId);
}

/** 按 ID 查找，用户版本优先 */
function getCatById(id) {
  const userCats = loadUserCats();
  const found = userCats.find(c => String(c.id) === String(id));
  if (found) return found;
  return SEED_CATS.find(c => String(c.id) === String(id));
}

function getSeekingCats() {
  return getAllCats().filter(c => c.adoption_status === 'seeking');
}

/** 创建新猫咪（存本地缓存） */
function addCat(cat) {
  const cats = loadUserCats();
  const { generateArchiveCode } = require('../utils/constants');
  // 结构化生成：品种 + 地区代码(无则默认) + 日期 + 随机
  let code = cat.archive_code || generateArchiveCode(cat.breed || '其他田园猫', ['000000']);
  const allCodes = getAllCats().map(c => c.archive_code);
  while (allCodes.includes(code)) code = generateArchiveCode(cat.breed || '其他', ['000000']);
  const newCat = {
    ...cat,
    archive_code: code,
    id: Date.now(),  // 用时间戳做临时 ID
    created_by: getApp().globalData.userId || 'user_me',
    created_at: new Date().toISOString(),
  };
  cats.unshift(newCat);
  saveUserCats(cats);
  return newCat;
}

/** 更新猫咪 */
function updateCat(id, data) {
  // 先查用户创建的
  const cats = loadUserCats();
  const idx = cats.findIndex(c => String(c.id) === String(id));
  if (idx !== -1) {
    cats[idx] = { ...cats[idx], ...data };
    saveUserCats(cats);
    return cats[idx];
  }
  // 种子数据不能真改，但可以存一份覆盖版本
  const seed = SEED_CATS.find(c => String(c.id) === String(id));
  if (seed) {
    const updated = { ...seed, ...data };
    cats.unshift(updated);
    saveUserCats(cats);
    return updated;
  }
  return null;
}

module.exports = {
  getAllCats, getMyCats, getCatById, getSeekingCats,
  addCat, updateCat,
};
