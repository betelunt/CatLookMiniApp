// 微信一键登录
Page({
  data: { loading: false },

  async onLogin() {
    this.setData({ loading: true });
    try {
      const app = getApp();
      await app.doLogin();
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1200);
    } catch (e) {
      console.error('登录失败:', e);
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
    }
    this.setData({ loading: false });
  },

  /** 点击隐私政策链接 —— 打开完整的协议与隐私政策页面 */
  onGoAgreement() {
    wx.navigateTo({ url: '/pages/agreement/agreement' });
  },

  /** 查看隐私协议（系统弹窗版本） */
  onShowPrivacy() {
    if (wx.requirePrivacyAuthorize) {
      wx.requirePrivacyAuthorize({
        success: () => {},
        fail: () => {},
      });
    } else {
      wx.showToast({ title: '请在微信后台配置隐私协议', icon: 'none' });
    }
  },
});
