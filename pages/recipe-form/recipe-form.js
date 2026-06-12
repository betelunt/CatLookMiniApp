// 创建 / 编辑猫饭配方
const { getUserRecipes, saveRecipe, updateRecipe } = require('../../utils/recipes');

const SCENES = ['日常营养', '肠胃调理', '美毛护肤', '术后恢复', '夏季消暑', '体重管理'];

Page({
  data: {
    isEdit: false,
    id: null,
    scenes: SCENES,
    form: {
      name: '',
      scene: '',
      sceneTag: '',
      time: '',
      difficulty: '简单',
      ingredients: [{ name: '', amount: '' }],
      steps: [''],
      tips: '',
    },
    submitting: false,
  },

  onLoad(options) {
    if (options.id) {
      const userRecipes = getUserRecipes();
      const recipe = userRecipes.find(r => r.id === options.id);
      if (recipe) {
        this.setData({
          isEdit: true,
          id: options.id,
          form: {
            name: recipe.name || '',
            scene: recipe.scene || '',
            sceneTag: recipe.sceneTag || '',
            time: recipe.time || '',
            difficulty: recipe.difficulty || '简单',
            ingredients: recipe.ingredients?.length ? recipe.ingredients : [{ name: '', amount: '' }],
            steps: recipe.steps?.length ? recipe.steps : [''],
            tips: recipe.tips || '',
          },
        });
      }
    }
  },

  // ── 基础字段 ──

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onSceneChange(e) {
    const idx = e.detail.value;
    this.setData({ 'form.scene': SCENES[idx] });
  },

  onDifficultyChange(e) {
    const idx = e.detail.value;
    this.setData({ 'form.difficulty': ['简单', '中等', '复杂'][idx] });
  },

  // ── 食材动态行 ──

  onIngredientInput(e) {
    const { idx, field } = e.currentTarget.dataset;
    this.setData({ [`form.ingredients[${idx}].${field}`]: e.detail.value });
  },

  addIngredient() {
    const list = this.data.form.ingredients;
    list.push({ name: '', amount: '' });
    this.setData({ 'form.ingredients': list });
  },

  removeIngredient(e) {
    const idx = e.currentTarget.dataset.idx;
    const list = this.data.form.ingredients;
    if (list.length <= 1) return;
    list.splice(idx, 1);
    this.setData({ 'form.ingredients': list });
  },

  // ── 步骤动态行 ──

  onStepInput(e) {
    const { idx } = e.currentTarget.dataset;
    this.setData({ [`form.steps[${idx}]`]: e.detail.value });
  },

  addStep() {
    const list = this.data.form.steps;
    list.push('');
    this.setData({ 'form.steps': list });
  },

  removeStep(e) {
    const idx = e.currentTarget.dataset.idx;
    const list = this.data.form.steps;
    if (list.length <= 1) return;
    list.splice(idx, 1);
    this.setData({ 'form.steps': list });
  },

  // ── 提交 ──

  onSubmit() {
    const f = this.data.form;
    if (!f.name.trim()) {
      wx.showToast({ title: '请填写配方名称', icon: 'none' });
      return;
    }
    if (!f.scene) {
      wx.showToast({ title: '请选择适用场景', icon: 'none' });
      return;
    }

    // 过滤空食材和空步骤
    const ingredients = f.ingredients.filter(i => i.name.trim());
    const steps = f.steps.filter(s => s.trim());

    if (ingredients.length === 0) {
      wx.showToast({ title: '请至少添加一种食材', icon: 'none' });
      return;
    }
    if (steps.length === 0) {
      wx.showToast({ title: '请至少添加一个步骤', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    const now = new Date().toISOString().slice(0, 10);
    const app = getApp();

    const recipe = {
      name: f.name.trim(),
      scene: f.scene,
      sceneTag: f.sceneTag.trim() || f.scene,
      time: f.time.trim(),
      difficulty: f.difficulty,
      ingredients,
      steps,
      tips: f.tips.trim(),
      photoUrl: '',
      author: {
        nickName: app.globalData.userInfo?.nickName || '猫咪守护者',
        avatarUrl: app.globalData.userInfo?.avatarUrl || '',
      },
      createdAt: now,
      likeCount: 0,
    };

    if (this.data.isEdit) {
      updateRecipe(this.data.id, recipe);
    } else {
      recipe.id = 'user_' + Date.now();
      saveRecipe(recipe);
    }

    wx.showToast({
      title: this.data.isEdit ? '已更新' : '发布成功！',
      icon: 'success',
    });
    setTimeout(() => wx.navigateBack(), 1000);
    this.setData({ submitting: false });
  },
});
