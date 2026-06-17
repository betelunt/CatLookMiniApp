// 协议回传页
Page({
  data: {
    catId: '',
    cats: [],
    catIndex: -1,
    uploading: false,
    uploaded: false,
  },

  onLoad(options) {
    if (options.cat_id) {
      this.setData({ catId: options.cat_id });
    } else {
      this.loadMyCats();
    }
  },

  async loadMyCats() {
    const app = getApp();
    if (!app.globalData.userId) return;
    const { select } = require('../../utils/supabase');
    const cats = await select('cats', {
      columns: 'id,name,breed',
      filters: { created_by: app.globalData.userId },
      order: { column: 'created_at', direction: 'desc' },
    });
    this.setData({ cats: cats || [] });
  },

  onCatSelect(e) {
    const idx = Number(e.detail.value);
    this.setData({ catId: this.data.cats[idx]?.id || '', catIndex: idx });
  },

  onChooseAndUpload() {
    if (!this.data.catId) {
      wx.showToast({ title: '请先选择一只猫咪', icon: 'none' });
      return;
    }
    const doPick = () => {
      wx.chooseImage({
        count: 1, sourceType: ['album', 'camera'],
        success: (res) => { this.uploadAgreement(res.tempFilePaths[0]); },
      });
    };
    if (wx.requirePrivacyAuthorize) {
      wx.requirePrivacyAuthorize({ success: () => doPick(), fail: () => doPick() });
    } else {
      doPick();
    }
  },

  async uploadAgreement(filePath) {
    this.setData({ uploading: true });
    try {
      const base64 = wx.getFileSystemManager().readFileSync(filePath, 'base64');
      const res = await wx.cloud.callFunction({
        name: 'process-agreement',
        data: {
          cat_id: this.data.catId,
          image_base64: base64,
          user_id: getApp().globalData.userId,
        },
      });
      if (res.result.success) {
        this.setData({ uploaded: true, uploading: false });
        wx.showToast({ title: '回传成功！已自动模糊处理' });
      }
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '回传失败', icon: 'none' });
      this.setData({ uploading: false });
    }
  },
});
