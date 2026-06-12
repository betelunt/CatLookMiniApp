// 协议模板下载页
Page({
  data: { catId: '', downloading: false },

  onLoad(options) {
    if (options.cat_id) this.setData({ catId: options.cat_id });
  },

  async onDownload() {
    this.setData({ downloading: true });
    try {
      const res = await wx.cloud.callFunction({
        name: 'generate-pdf',
        data: { cat_id: this.data.catId },
      });
      const { downloadUrl } = res.result;
      // 下载文件
      wx.downloadFile({
        url: downloadUrl,
        success: (res) => {
          wx.openDocument({
            filePath: res.tempFilePath,
            showMenu: true, // 允许分享给微信好友
            success: () => wx.showToast({ title: '已打开协议模板' }),
          });
        },
        fail: () => wx.showToast({ title: '下载失败', icon: 'none' }),
      });
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '生成失败', icon: 'none' });
    }
    this.setData({ downloading: false });
  },
});
