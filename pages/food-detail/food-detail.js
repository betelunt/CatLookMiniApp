// 食物 / 配方详情页
const { getById } = require('../../utils/recipes');

Page({
  data: {
    food: null,     // 食材对象
    recipe: null,   // 配方对象
    isRecipe: false,
  },

  onLoad(options) {
    if (!options.id) return;

    // 判断是配方还是食材
    if (options.type === 'recipe' || options.id.startsWith('seed_') || options.id.startsWith('user_')) {
      this.loadRecipe(options.id);
    } else {
      this.loadFood(options.id);
    }
  },

  loadFood(id) {
    const data = require('../../data/foods');
    const food = data.find(f => f.id === id);
    if (food) this.setData({ food, isRecipe: false });
  },

  loadRecipe(id) {
    const recipe = getById(id);
    if (recipe) this.setData({ recipe, isRecipe: true });
  },
});
