// 协议模板下载 — 从 Supabase Storage 下载 PDF 模板
const PDF_TEMPLATE_URL = 'https://d5msiv8g91huch72eu20.baseapi.memfiredb.com/storage/v1/object/public/agreements/template/adoption-agreement-template.pdf';

Page({
  data: { downloading: false },

  onDownload() {
    this.setData({ downloading: true });
    wx.showLoading({ title: '下载中...' });
    wx.downloadFile({
      url: PDF_TEMPLATE_URL,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            fileType: 'pdf',
            showMenu: true,
            success: () => wx.showToast({ title: '已打开领养协议' }),
            fail: () => wx.showToast({ title: '打开失败，请重试', icon: 'none' }),
          });
        } else {
          wx.showToast({ title: '下载失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '下载失败，请检查网络', icon: 'none' });
      },
      complete: () => this.setData({ downloading: false }),
    });
  },
});
