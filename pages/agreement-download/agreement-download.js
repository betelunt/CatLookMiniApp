// 协议模板下载页
const AGREEMENT_TEMPLATE_URL = 'https://d5msiv8g91huch72eu20.baseapi.memfiredb.com/storage/v1/object/public/agreements/template/adoption-agreement-template.doc';

Page({
  data: { downloading: false },

  onDownload() {
    this.setData({ downloading: true });
    wx.downloadFile({
      url: AGREEMENT_TEMPLATE_URL,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            fileType: 'doc',
            showMenu: true,
            success: () => wx.showToast({ title: '已打开领养协议' }),
            fail: () => wx.showToast({ title: '打开失败，请重试', icon: 'none' }),
          });
        } else {
          wx.showToast({ title: '下载失败', icon: 'none' });
        }
      },
      fail: () => wx.showToast({ title: '下载失败，请检查网络', icon: 'none' }),
      complete: () => this.setData({ downloading: false }),
    });
  },
});
