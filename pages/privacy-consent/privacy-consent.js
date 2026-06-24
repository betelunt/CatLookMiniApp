// 隐私协议同意页面
const app = getApp();

Page({
  data: {
    agreed: false,
  },

  onLoad() {
    // 从全局读取 privacy resolve 回调
    this._resolve = app.globalData._privacyResolve;
  },

  onUnload() {
    // 页面卸载时清除全局引用
    if (app.globalData._privacyResolve) {
      app.globalData._privacyResolve = null;
    }
  },

  /** 勾选/取消勾选 */
  toggleAgree() {
    this.setData({ agreed: !this.data.agreed });
  },

  /** 同意并继续 */
  onAgree() {
    if (!this.data.agreed) return;
    if (this._resolve) {
      this._resolve({ event: 'agree' });
    }
    app.globalData._privacyResolve = null;
    wx.navigateBack({ delta: 1 });
  },

  /** 拒绝 */
  onDisagree() {
    wx.showModal({
      title: '提示',
      content: '拒绝隐私协议后，将无法使用拍照识别、照片上传等功能。确定要拒绝吗？',
      confirmText: '再想想',
      cancelText: '确认拒绝',
      success: (res) => {
        if (!res.confirm) {
          // 用户点了「确认拒绝」
          if (this._resolve) {
            this._resolve({ event: 'disagree' });
          }
          app.globalData._privacyResolve = null;
          wx.navigateBack({ delta: 1 });
        }
      },
    });
  },
});
