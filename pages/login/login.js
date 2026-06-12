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
});
