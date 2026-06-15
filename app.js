// ── 猫录助手 微信小程序 ──────────────────────────────────
const { initSupabase } = require('./utils/supabase');
const { getToken } = require('./utils/auth');

// 🔧 全局开发模式开关 —— 唯一控制点
//    true  = mock 数据，无需云函数/数据库
//    false = 真实 API，需要云函数已部署 + 数据库已迁移
const DEV_MODE = false;

App({
  globalData: {
    DEV_MODE,           // ← 所有页面通过 getApp().globalData.DEV_MODE 读取
    isLoggedIn: false,
    token: null,
    userInfo: null,
    userId: null,
  },

  onLaunch() {
    // 1. Init cloud environment
    wx.cloud.init({ env: 'cloudbase-d2g4q6xck93c02591' });

    // 2. Init Supabase REST client
    initSupabase();

    // 3. 隐私协议授权处理（微信必查项）
    this.initPrivacy();

    // 4. Check if we have a cached token
    const cached = getToken();
    if (cached) {
      this.globalData.token = cached.token;
      this.globalData.userId = cached.userId;
      this.globalData.isLoggedIn = true;
    }

    // 5. Check for system updates
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已就绪，是否重启应用？',
        success(res) {
          if (res.confirm) updateManager.applyUpdate();
        },
      });
    });
  },

  /** 初始化隐私协议授权监听 */
  initPrivacy() {
    // 检查基础库是否支持隐私授权 API
    if (wx.onNeedPrivacyAuthorization) {
      wx.onNeedPrivacyAuthorization((resolve) => {
        // 弹出系统隐私协议弹窗
        wx.requirePrivacyAuthorize({
          success: () => {
            // 用户同意
            resolve({ event: 'agree' });
          },
          fail: () => {
            // 用户拒绝
            resolve({ event: 'disagree' });
          },
        });
      });
    }
  },

  /** 执行登录（开发模式使用 mock，正式模式使用微信云函数） */
  async doLogin() {
    if (DEV_MODE) {
      return this.mockLogin();
    }
    return this.realLogin();
  },

  /** Mock 登录 —— 云函数未部署时使用 */
  mockLogin() {
    return new Promise((resolve) => {
      wx.showLoading({ title: '登录中...' });
      setTimeout(() => {
        const mockToken = 'dev-mock-token-' + Date.now();
        const mockUserId = '00000000-0000-0000-0000-000000000001';

        this.globalData.isLoggedIn = true;
        this.globalData.token = mockToken;
        this.globalData.userId = mockUserId;

        wx.setStorageSync('supabase_token', mockToken);
        wx.setStorageSync('user_id', mockUserId);

        wx.hideLoading();
        resolve({ token: mockToken, userId: mockUserId });
      }, 800);
    });
  },

  /** 真实登录 —— 通过云函数 auth-bridge */
  async realLogin() {
    const { code } = await wx.login();
    const res = await wx.cloud.callFunction({
      name: 'auth-bridge',
      data: { code },
    });
    const { token, userId } = res.result;

    this.globalData.isLoggedIn = true;
    this.globalData.token = token;
    this.globalData.userId = userId;

    wx.setStorageSync('supabase_token', token);
    wx.setStorageSync('user_id', userId);

    return { token, userId };
  },

  /** 清除登录态 */
  logout() {
    this.globalData.isLoggedIn = false;
    this.globalData.token = null;
    this.globalData.userId = null;
    wx.removeStorageSync('supabase_token');
    wx.removeStorageSync('user_id');
  },
});
