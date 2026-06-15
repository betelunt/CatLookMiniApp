// 我的猫咪列表 — 完整列表（从「我的」跳转）
const { getMyCats } = require('../../data/mock');
const { STATUS_COLORS } = require('../../utils/constants');
const { cacheSet, cacheGet } = require('../../utils/cache');
const { getThumbUrl } = require('../../utils/supabase');

const CACHE_KEY = 'my_cats';
const CACHE_TTL = 60;   // 我的猫咪变更频率低，缓存可以长一点
const PAGE_SIZE = 20;

Page({
  data: { cats: [], loading: true, statusColors: STATUS_COLORS },

  onShow() { this.loadCats(); },

  onPullDownRefresh() {
    this.loadCats(true).then(() => wx.stopPullDownRefresh());
  },

  async loadCats(forceRefresh = false) {
    this.setData({ loading: true });
    const app = getApp();
    if (app.globalData.DEV_MODE) {
      await new Promise(r => setTimeout(r, 300));
      this.setData({ cats: getMyCats(), loading: false });
      return;
    }
    let cats;
    if (!forceRefresh) {
      cats = cacheGet(CACHE_KEY);
    }
    if (!cats) {
      const { select } = require('../../utils/supabase');
      cats = await select('cats', {
        columns: 'id,name,breed,photo_url,archive_code,health_status,adoption_status,created_at',
        filters: { created_by: app.globalData.userId },
        order: { column: 'created_at', direction: 'desc' },
        limit: PAGE_SIZE,
      });
      cats = cats || [];
      cacheSet(CACHE_KEY, cats, CACHE_TTL);
    }
    const thumbCats = cats.map(c => ({ ...c, photo_url: getThumbUrl(c.photo_url, 200) }));
    this.setData({ cats: thumbCats, loading: false });
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
