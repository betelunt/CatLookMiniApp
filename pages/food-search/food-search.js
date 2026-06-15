// 食物查询 Tab3 — 食材搜索 + 猫饭配方推荐 + 营养知识
const { FOOD_CATEGORIES } = require('../../utils/constants');
const { getAllRecipes, getByScene } = require('../../utils/recipes');
const { NUTRIENTS, SUPPLEMENTS } = require('../../data/nutrition');
const foodsData = require('../../data/foods');

/** 预处理营养素数据，注入食物名称映射 */
function buildNutrients() {
  return NUTRIENTS.map(n => ({
    ...n,
    _foodMap: (n.foodIds || []).reduce((map, fid) => {
      const food = foodsData.find(f => f.id === fid);
      if (food) map[fid] = food.name + (food.safety === 'danger' ? '⚠️' : '');
      return map;
    }, {}),
  }));
}

Page({
  data: {
    searchText: '',
    categories: FOOD_CATEGORIES,
    activeCategory: '',
    results: [],
    loading: false,
    noResult: false,
    recipes: [],           // 全部配方（种子+用户）
    filteredRecipes: [],   // 场景筛选后的配方
    recipeScenes: [],      // 配方场景列表
    activeScene: '',       // 当前选中场景
    // 营养知识
    showNutrition: false,        // 是否显示营养知识面板
    nutrients: buildNutrients(), // 全部营养素（已注入食物名称映射）
    supplements: SUPPLEMENTS,    // 补充剂列表
    selectedNutrientId: '',      // 当前选中营养素
  },

  onShow() {
    this.loadRecipes();
  },

  /** 加载全部配方 */
  loadRecipes() {
    const all = getAllRecipes();
    const scenes = [...new Set(all.map(r => r.scene))];
    this.setData({ recipes: all, filteredRecipes: all, recipeScenes: scenes });
  },

  onSearch(e) {
    const text = e.detail.value.trim();
    this.setData({ searchText: text });
    if (!text) { this.setData({ results: [], noResult: false }); return; }
    this.doSearch(text);
  },

  onCategoryTap(e) {
    const cat = e.currentTarget.dataset.category;
    const active = this.data.activeCategory === cat ? '' : cat;
    this.setData({ activeCategory: active });
    this.doSearch(this.data.searchText, active);
  },

  /** 配方场景筛选 */
  onSceneTap(e) {
    const scene = e.currentTarget.dataset.scene;
    const active = this.data.activeScene === scene ? '' : scene;
    this.setData({
      activeScene: active,
      filteredRecipes: active ? getByScene(active) : this.data.recipes,
    });
  },

  doSearch(query, category) {
    this.setData({ loading: true, noResult: false });
    const data = require('../../data/foods');
    const q = (query || '').toLowerCase();

    // 搜索食材
    let results = data.filter(item => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = !category || item.category === category;
      return matchName && matchCat;
    });

    // 同时搜索配方（名称/场景/食材）
    if (q && !category) {
      const allRecipes = getAllRecipes();
      const matchedRecipes = allRecipes.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.scene.toLowerCase().includes(q) ||
        (r.ingredients || []).some(i => i.name.toLowerCase().includes(q))
      );
      matchedRecipes.forEach(r => {
        results.push({
          id: r.id, name: r.name, category: 'recipe',
          categoryLabel: '🍳 猫友配方', safety: 'safe', safetyLabel: r.scene,
          effect: (r.author?.nickName || '猫友') + ' · ' + (r.sceneTag || ''),
          advice: r.tips || '',
          _isRecipe: true,
        });
      });
    }

    this.setData({
      results: results.slice(0, 50),
      loading: false,
      noResult: results.length === 0,
    });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/food-detail/food-detail?id=${id}` });
  },

  /** 切换营养知识面板 */
  toggleNutrition() {
    this.setData({ showNutrition: !this.data.showNutrition, selectedNutrientId: '' });
  },

  /** 选中营养素查看详情 */
  onNutrientTap(e) {
    const id = e.currentTarget.dataset.id;
    const selected = this.data.selectedNutrientId === id ? '' : id;
    this.setData({ selectedNutrientId: selected });
  },

  /** 获取营养素对应的食物列表 */
  getNutrientFoods(nutrient) {
    if (!nutrient || !nutrient.foodIds) return [];
    return nutrient.foodIds
      .map(id => foodsData.find(f => f.id === id))
      .filter(Boolean);
  },
});
