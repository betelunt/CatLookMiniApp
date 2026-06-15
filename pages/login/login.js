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

  /** 点击隐私政策链接 —— 弹出系统隐私协议窗口 */
  onShowPrivacy() {
    if (wx.requirePrivacyAuthorize) {
      wx.requirePrivacyAuthorize({
        success: () => {
          // 用户查看了隐私协议
        },
        fail: () => {
          // 用户关闭了弹窗（不是拒绝，只是关闭查看）
        },
      });
    } else {
      wx.showToast({ title: '请在微信后台配置隐私协议', icon: 'none' });
    }
  },
});
