// 个人中心 Tab4
const { getMyCats } = require('../../data/mock');
const { getUserRecipes } = require('../../utils/recipes');
const { getMyReports } = require('../../data/blacklist');
const { STATUS_COLORS } = require('../../utils/constants');
const { cacheSet, cacheGet } = require('../../utils/cache');
const { getThumbUrl } = require('../../utils/supabase');

const CACHE_KEY_PROFILE = 'profile_cats';
const CACHE_TTL = 30;
Page({
  data: {
    isLoggedIn: false,
    userInfo: { avatarUrl: '', nickName: '' },
    wechatId: '',
    recentCats: [],         // 仅展示最近 3 只
    totalCatCount: 0,
    recipeCount: 0,         // 我的配方数
    reportCount: 0,         // 我的举报数
    catLoading: true,
    statusColors: STATUS_COLORS,
  },

  onShow() {
    const app = getApp();
    if (app.globalData.isLoggedIn) {
      this.setData({ isLoggedIn: true });
      this.loadUserInfo();
      this.loadRecentCats();
      this.loadRecipeCount();
      this.loadReportCount();
    } else {
      this.setData({ isLoggedIn: false, catLoading: false });
    }
  },

  loadUserInfo() {
    const wechatId = wx.getStorageSync('wechat_id') || '';
    const savedAvatar = wx.getStorageSync('profile_avatar') || '';
    const savedNick = wx.getStorageSync('profile_nick') || '';
    this.setData({
      wechatId,
      'userInfo.avatarUrl': savedAvatar,
      'userInfo.nickName': savedNick,
    });
  },

  /** 选择头像 — open-type="chooseAvatar" */
  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl;
    this.setData({ 'userInfo.avatarUrl': avatarUrl });
    wx.setStorageSync('profile_avatar', avatarUrl);
  },

  /** 昵称输入 — type="nickname" */
  onNickInput(e) {
    const nickName = e.detail.value;
    this.setData({ 'userInfo.nickName': nickName });
    wx.setStorageSync('profile_nick', nickName);
  },

  loadRecipeCount() {
    const recipes = getUserRecipes();
    this.setData({ recipeCount: recipes.length });
  },

  async loadReportCount() {
    try {
      const reports = await getMyReports();
      this.setData({ reportCount: reports.length });
    } catch (e) {
      // 静默
    }
  },

  async loadRecentCats() {
    const app = getApp();
    this.setData({ catLoading: true });
    try {
      if (app.globalData.DEV_MODE) {
        await new Promise(r => setTimeout(r, 300));
        const all = getMyCats();
        this.setData({
          recentCats: all.slice(0, 3).map(c => ({ ...c, photo_url: getThumbUrl(c.photo_url, 150) })),
          totalCatCount: all.length,
          catLoading: false,
        });
        return;
      }
      // 缓存读取
      let cats = cacheGet(CACHE_KEY_PROFILE);
      if (!cats) {
        const { select } = require('../../utils/supabase');
        cats = await select('cats', {
          columns: 'id,name,breed,photo_url,archive_code,health_status,adoption_status,created_at',
          filters: { created_by: app.globalData.userId },
          order: { column: 'created_at', direction: 'desc' },
          limit: 3,
        });
        cats = cats || [];
        cacheSet(CACHE_KEY_PROFILE, cats, CACHE_TTL);
      }
      // 缩略图转换
      const recentCats = cats.map(c => ({ ...c, photo_url: getThumbUrl(c.photo_url, 150) }));
      this.setData({
        recentCats,
        totalCatCount: recentCats.length,
        catLoading: false,
      });
    } catch (e) {
      console.error(e);
      this.setData({ catLoading: false });
    }
  },

  // 导航
  goLogin() { wx.navigateTo({ url: '/pages/login/login' }); },
  goAddCat() { wx.navigateTo({ url: '/pages/cat-form/cat-form' }); },
  goMyCats() { wx.navigateTo({ url: '/pages/my-cats/my-cats' }); },
  goMyRecipes() { wx.navigateTo({ url: '/pages/my-recipes/my-recipes' }); },
  goMyAgreements() { wx.navigateTo({ url: '/pages/my-agreements/my-agreements' }); },
  goMyReports() { wx.navigateTo({ url: '/pages/my-reports/my-reports' }); },

  // 编辑联系方式
  onEditContact() {
    const that = this;
    wx.showModal({
      title: '设置联系方式',
      editable: true,
      placeholderText: '请输入您的微信号',
      content: that.data.wechatId,
      success(res) {
        if (res.confirm && res.content) {
          wx.setStorageSync('wechat_id', res.content.trim());
          that.setData({ wechatId: res.content.trim() });
          wx.showToast({ title: '已更新' });
        }
      },
    });
  },

  // 快捷操作（在最近猫咪卡片上）
  goEditCat(e) {
    wx.navigateTo({ url: `/pages/cat-form/cat-form?id=${e.currentTarget.dataset.id}` });
  },
  toggleAdoption(e) {
    const id = e.currentTarget.dataset.id;
    const cats = this.data.recentCats.map(c => {
      if (c.id === id) c.adoption_status = c.adoption_status === 'seeking' ? 'none' : 'seeking';
      return c;
    });
    this.setData({ recentCats: cats });
    const cat = cats.find(c => c.id === id);
    wx.showToast({ title: cat.adoption_status === 'seeking' ? '已发布到领养' : '已下架', icon: 'success' });
  },

  onLogout() {
    getApp().logout();
    this.setData({ isLoggedIn: false, recentCats: [], totalCatCount: 0 });
    wx.showToast({ title: '已退出登录' });
  },
});
