// 猫咪领养详情
const { select } = require('../../utils/supabase');
const { getCatById } = require('../../data/mock');
const { STATUS_COLORS } = require('../../utils/constants');

Page({
  data: {
    cat: null, rescuerContact: 'cat_rescue_2024',
    statusColors: STATUS_COLORS, loading: true,
  },

  onLoad(options) {
    if (options.id) this.loadCat(options.id);
  },

  async loadCat(id) {
    this.setData({ loading: true });
    try {
      if (getApp().globalData.DEV_MODE) {
        await new Promise(r => setTimeout(r, 300));
        this.setData({ cat: getCatById(id), loading: false });
        return;
      }
      const cats = await select('cats', { filters: { id } });
      if (cats && cats[0]) this.setData({ cat: cats[0], loading: false });
    } catch (e) {
      console.error(e);
      this.setData({ loading: false });
    }
  },

  onApplyAdopt() {
    wx.showModal({
      title: '救助人联系方式',
      content: `微信号: ${this.data.rescuerContact}\n\n请添加救助人微信沟通领养事宜。\n确认领养后回到平台下载协议模板。`,
      showCancel: false, confirmText: '我知道了',
    });
  },

  onDownloadAgreement() {
    wx.navigateTo({ url: `/pages/agreement-download/agreement-download?cat_id=${this.data.cat?.id || ''}` });
  },

  onShareCard() {
    wx.showToast({ title: '开发模式暂不支持', icon: 'none' });
  },
});
