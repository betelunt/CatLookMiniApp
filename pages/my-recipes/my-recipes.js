// 我的猫饭配方 — 列表 + 管理
const { getUserRecipes, deleteRecipe } = require('../../utils/recipes');

Page({
  data: {
    recipes: [],
    loading: true,
  },

  onShow() {
    this.loadRecipes();
  },

  loadRecipes() {
    this.setData({ loading: true });
    const recipes = getUserRecipes();
    this.setData({ recipes, loading: false });
  },

  /** 创建新配方 */
  goCreate() {
    wx.navigateTo({ url: '/pages/recipe-form/recipe-form' });
  },

  /** 编辑配方 */
  goEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/recipe-form/recipe-form?id=${id}` });
  },

  /** 查看详情 */
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/food-detail/food-detail?id=${id}&type=recipe` });
  },

  /** 删除配方 */
  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    const recipe = this.data.recipes.find(r => r.id === id);
    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${recipe?.name || '这个配方'}」吗？`,
      success: (res) => {
        if (res.confirm) {
          deleteRecipe(id);
          this.loadRecipes();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      },
    });
  },
});
