// 协议回传页
Page({
  data: { catId: '', uploading: false, uploaded: false },

  onLoad(options) {
    if (options.cat_id) this.setData({ catId: options.cat_id });
  },

  onChooseAndUpload() {
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
      // 上传到云函数处理（自动模糊化）
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
