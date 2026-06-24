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
    console.log('[privacy] onNeedPrivacyAuthorization available:', !!wx.onNeedPrivacyAuthorization);
    console.log('[privacy] requirePrivacyAuthorize available:', !!wx.requirePrivacyAuthorize);

    // 查看当前隐私授权状态
    if (wx.getPrivacySetting) {
      wx.getPrivacySetting({
        success: (res) => {
          console.log('[privacy] current setting:', JSON.stringify(res));
          // res.needAuthorization: 是否需要用户授权
          // res.privacyContractName: 隐私协议名称
        },
        fail: (err) => console.error('[privacy] getPrivacySetting failed:', err),
      });
    }

    if (wx.onNeedPrivacyAuthorization) {
      console.log('[privacy] registering onNeedPrivacyAuthorization listener');
      const app = this;
      wx.onNeedPrivacyAuthorization((resolve, eventInfo) => {
        console.log('[privacy] onNeedPrivacyAuthorization FIRED! eventInfo:', JSON.stringify(eventInfo));
        // 存储 resolve 回调，跳转隐私协议页面
        app.globalData._privacyResolve = resolve;
        wx.navigateTo({ url: '/pages/privacy-consent/privacy-consent' });
      });
      console.log('[privacy] listener registered');
    } else {
      console.warn('[privacy] onNeedPrivacyAuthorization NOT supported in this base library');
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
    wx.showLoading({ title: '登录中...' });
    try {
      const { code } = await wx.login();
      console.log('[login] wx.login code:', code ? code.slice(0, 8) + '...' : 'null');

      const res = await wx.cloud.callFunction({
        name: 'auth-bridge',
        data: { code },
      });

      wx.hideLoading();
      console.log('[login] cloud function result:', JSON.stringify(res));

      if (!res.result || !res.result.ok) {
        const errMsg = (res.result && res.result.error) || '未知错误';
        wx.showToast({ title: '登录失败: ' + errMsg, icon: 'none', duration: 3000 });
        throw new Error(errMsg);
      }

      const { token, userId } = res.result;

      this.globalData.isLoggedIn = true;
      this.globalData.token = token;
      this.globalData.userId = userId;

      wx.setStorageSync('supabase_token', token);
      wx.setStorageSync('user_id', userId);

      return { token, userId };
    } catch (e) {
      wx.hideLoading();
      console.error('[login] 登录异常:', e);
      wx.showToast({ title: '登录异常: ' + (e.message || '超时'), icon: 'none', duration: 3000 });
      throw e;
    }
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
