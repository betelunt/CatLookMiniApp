// 猫咪详情页 — 只读浏览（从 Tab1 进入）
const { select } = require('../../utils/supabase');
const { getCatById } = require('../../data/mock');
const { STATUS_COLORS, GENDER_LABELS } = require('../../utils/constants');

Page({
  data: { cat: null, statusColors: STATUS_COLORS, genderLabels: GENDER_LABELS, loading: true },

  onLoad(options) {
    if (options.id) this.loadCat(options.id);
  },

  async loadCat(id) {
    this.setData({ loading: true });
    try {
      if (getApp().globalData.DEV_MODE) {
        await new Promise(r => setTimeout(r, 300));
        const cat = getCatById(id);
        this.setData({ cat, loading: false });
        return;
      }
      const cats = await select('cats', { filters: { id } });
      if (cats && cats[0]) this.setData({ cat: cats[0], loading: false });
    } catch (e) {
      console.error(e);
      this.setData({ loading: false });
    }
  },
});
