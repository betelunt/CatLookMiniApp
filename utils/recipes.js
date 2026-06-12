// ── 猫饭配方 — 本地存储管理 ──────────────────────────────
// DEV_MODE 阶段全部存本地 wx.Storage
// 后续切 Supabase 只需换这里的实现

const STORAGE_KEY = 'user_recipes';

/** 获取全部配方（种子数据 + 用户自创） */
function getAllRecipes() {
  const userRecipes = getUserRecipes();
  return [...SEED_RECIPES, ...userRecipes];
}

/** 获取用户自己创建的配方 */
function getUserRecipes() {
  try {
    return wx.getStorageSync(STORAGE_KEY) || [];
  } catch (e) {
    return [];
  }
}

/** 按场景筛选 */
function getByScene(scene) {
  return getAllRecipes().filter(r => r.scene === scene);
}

/** 按ID查找 */
function getById(id) {
  return getAllRecipes().find(r => r.id === id);
}

/** 保存新配方（追加到本地存储） */
function saveRecipe(recipe) {
  const list = getUserRecipes();
  list.unshift(recipe);  // 最新的放前面
  wx.setStorageSync(STORAGE_KEY, list);
  return recipe;
}

/** 更新配方 */
function updateRecipe(id, updates) {
  const list = getUserRecipes();
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  wx.setStorageSync(STORAGE_KEY, list);
  return list[idx];
}

/** 删除配方 */
function deleteRecipe(id) {
  const list = getUserRecipes();
  const filtered = list.filter(r => r.id !== id);
  wx.setStorageSync(STORAGE_KEY, filtered);
}

// ═══════════════════════════════════════════════════════════
// 种子配方（假装来自天使用户，冷启动用）
// ═══════════════════════════════════════════════════════════

const SEED_RECIPES = [
  {
    id: 'seed_1', name: '鸡肉胡萝卜饭',
    scene: '日常营养', sceneTag: '每日健康',
    time: '15分钟', difficulty: '简单',
    ingredients: [
      { name: '鸡胸肉', amount: '60g' },
      { name: '胡萝卜', amount: '20g' },
      { name: '大米', amount: '20g' },
    ],
    steps: [
      '鸡胸肉洗净，沸水煮至全白（约8分钟），捞出沥干',
      '胡萝卜去皮切小块，煮至软烂',
      '大米煮成软饭',
      '鸡肉撕成细丝，胡萝卜捣泥，混合拌匀',
    ],
    tips: '不加任何调味料。每次做不超过2天食量，剩余冷藏。',
    photoUrl: '',
    author: { nickName: '橘猫铲屎官', avatarUrl: '' },
    createdAt: '2026-05-20',
    likeCount: 128,
  },
  {
    id: 'seed_2', name: '鸡胸肉南瓜泥',
    scene: '肠胃调理', sceneTag: '温和养胃',
    time: '12分钟', difficulty: '简单',
    ingredients: [
      { name: '鸡胸肉', amount: '50g' },
      { name: '南瓜', amount: '40g' },
    ],
    steps: [
      '鸡胸肉煮熟撕极细丝',
      '南瓜去皮蒸熟捣成泥',
      '二者混合搅匀呈糊状',
    ],
    tips: '腹泻时南瓜比例增加到50%，便秘时减少到30%。',
    photoUrl: '',
    author: { nickName: '布偶妈妈', avatarUrl: '' },
    createdAt: '2026-05-22',
    likeCount: 96,
  },
  {
    id: 'seed_3', name: '三文鱼美毛餐',
    scene: '美毛护肤', sceneTag: 'Omega-3滋养',
    time: '15分钟', difficulty: '简单',
    ingredients: [
      { name: '三文鱼', amount: '60g' },
      { name: '南瓜', amount: '20g' },
      { name: '鸡蛋黄', amount: '半个' },
    ],
    steps: [
      '三文鱼去骨去刺，蒸熟（约8分钟）',
      '仔细去净鱼刺，鱼肉捣碎',
      '南瓜蒸熟捣泥，熟蛋黄压碎',
      '三者混合拌匀',
    ],
    tips: '三文鱼必须全熟！每周1-2次。坚持3周毛色明显变亮。',
    photoUrl: '',
    author: { nickName: '三花小主', avatarUrl: '' },
    createdAt: '2026-05-25',
    likeCount: 203,
  },
  {
    id: 'seed_4', name: '牛肉蔬菜丁',
    scene: '日常营养', sceneTag: '高蛋白',
    time: '20分钟', difficulty: '简单',
    ingredients: [
      { name: '瘦牛肉', amount: '60g' },
      { name: '南瓜', amount: '20g' },
      { name: '西兰花', amount: '10g' },
    ],
    steps: [
      '牛肉去筋膜切小丁，沸水煮至全熟',
      '南瓜去皮切块蒸软捣泥',
      '西兰花切小朵煮软切碎',
      '混合拌匀放凉喂食',
    ],
    tips: '牛肉不能半生，务必全熟。每周2-3次即可。',
    photoUrl: '',
    author: { nickName: '英短奶爸', avatarUrl: '' },
    createdAt: '2026-05-28',
    likeCount: 67,
  },
  {
    id: 'seed_5', name: '鸡心鸭肉双拼',
    scene: '日常营养', sceneTag: '牛磺酸补充',
    time: '15分钟', difficulty: '简单',
    ingredients: [
      { name: '鸡心', amount: '30g' },
      { name: '鸭肉', amount: '50g' },
      { name: '南瓜', amount: '15g' },
    ],
    steps: [
      '鸡心对半切开洗净血水，鸭肉去皮切丁',
      '一起沸水煮至全熟（约8分钟）',
      '捞出切碎，南瓜蒸熟捣泥拌入',
    ],
    tips: '鸡心是天然牛磺酸来源，猫咪无法自身合成，必须从食物获取。',
    photoUrl: '',
    author: { nickName: '橘猫铲屎官', avatarUrl: '' },
    createdAt: '2026-05-30',
    likeCount: 89,
  },
  {
    id: 'seed_6', name: '牛肉肝泥营养糊',
    scene: '术后恢复', sceneTag: '补血益气',
    time: '18分钟', difficulty: '中等',
    ingredients: [
      { name: '瘦牛肉', amount: '50g' },
      { name: '鸡肝', amount: '10g' },
      { name: '胡萝卜', amount: '15g' },
    ],
    steps: [
      '牛肉去筋煮熟切碎',
      '鸡肝务必煮至全熟，切极细',
      '胡萝卜煮熟捣泥',
      '所有材料混合，加少量温水调成糊状',
    ],
    tips: '⚠️ 鸡肝量严格控制在10%以内！连喂不超过5天，防维生素A中毒。',
    photoUrl: '',
    author: { nickName: '布偶妈妈', avatarUrl: '' },
    createdAt: '2026-06-01',
    likeCount: 42,
  },
];

module.exports = {
  getAllRecipes,
  getUserRecipes,
  getByScene,
  getById,
  saveRecipe,
  updateRecipe,
  deleteRecipe,
  SEED_RECIPES,
};
