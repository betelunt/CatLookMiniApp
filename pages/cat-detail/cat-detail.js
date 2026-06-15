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
      const cats = await select('cats', { filters: { id, life_status: 'active' } });
      if (cats && cats[0]) {
        const cat = cats[0];
        // 详情页用原图，不压缩（仅此一页，不影响流量）
        this.setData({ cat, loading: false });
      }
    } catch (e) {
      console.error(e);
      this.setData({ loading: false });
    }
  },

  /** 点击照片用微信原生预览器查看原图（支持缩放） */
  onPreviewPhoto() {
    const url = this.data.cat?.photo_url;
    if (url) {
      wx.previewImage({ urls: [url], current: url });
    }
  },
});
