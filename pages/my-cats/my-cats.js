// 我的猫咪列表 — 完整列表（从「我的」跳转）
const { getMyCats } = require('../../data/mock');
const { STATUS_COLORS } = require('../../utils/constants');
Page({
  data: { cats: [], loading: true, statusColors: STATUS_COLORS },

  onShow() { this.loadCats(); },

  async loadCats() {
    this.setData({ loading: true });
    const app = getApp();
    if (app.globalData.DEV_MODE) {
      await new Promise(r => setTimeout(r, 300));
      this.setData({ cats: getMyCats(), loading: false });
      return;
    }
    // 真实 API: 从 Supabase 拉取当前用户的猫咪
    const { select } = require('../../utils/supabase');
    const cats = await select('cats', {
      filters: { created_by: app.globalData.userId },
      order: { column: 'created_at', direction: 'desc' },
    });
    this.setData({ cats: cats || [], loading: false });
  },

  goEdit(e) {
    wx.navigateTo({ url: `/pages/cat-form/cat-form?id=${e.currentTarget.dataset.id}` });
  },

  toggleAdoption(e) {
    const id = e.currentTarget.dataset.id;
    const cats = this.data.cats.map(c => {
      if (c.id === id) c.adoption_status = c.adoption_status === 'seeking' ? 'none' : 'seeking';
      return c;
    });
    this.setData({ cats });
    const cat = cats.find(c => c.id === id);
    wx.showToast({ title: cat.adoption_status === 'seeking' ? '已发布到领养' : '已下架', icon: 'success' });
  },

  deleteCat(e) {
    const id = e.currentTarget.dataset.id;
    const cat = this.data.cats.find(c => c.id === id);
    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${cat.name}」的档案吗？`,
      success: (res) => {
        if (res.confirm) {
          this.setData({ cats: this.data.cats.filter(c => c.id !== id) });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      },
    });
  },
});
