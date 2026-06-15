// 黑名单主页
const { getConfirmedReports, searchReports } = require('../../data/blacklist');

Page({
  data: {
    activeTab: 'adopter',     // 'adopter' | 'rescuer'
    reports: [],
    loading: true,
    showSearch: false,
    searchKeyword: '',
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  /** 加载已确认的黑名单 */
  async loadData() {
    this.setData({ loading: true });
    try {
      let reports;
      if (getApp().globalData.DEV_MODE) {
        await new Promise(r => setTimeout(r, 300));
        reports = getConfirmedReports(this.data.activeTab);
      } else {
        // 真实模式从 Supabase 查（限制 50 条，黑名单数据量不会太大）
        const { select } = require('../../utils/supabase');
        reports = await select('blacklist_reports', {
          columns: 'id,reported_name,reported_wx,role,reason,category,evidence_images,confirmations,created_at',
          filters: { status: 'confirmed', role: this.data.activeTab },
          order: { column: 'created_at', direction: 'desc' },
          limit: 50,
        });
      }
      this.setData({ reports: reports || [], loading: false });
    } catch (err) {
      console.error('加载黑名单失败:', err);
      this.setData({ loading: false });
    }
  },

  /** 切换 Tab */
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    this.setData({ activeTab: tab });
    this.loadData();
  },

  /** 搜索 */
  onToggleSearch() {
    this.setData({ showSearch: !this.data.showSearch, searchKeyword: '' });
    if (!this.data.showSearch) return;
    // 关闭搜索时恢复完整列表
    this.loadData();
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  onSearch() {
    const kw = this.data.searchKeyword.trim();
    if (!kw) {
      this.loadData();
      return;
    }
    if (getApp().globalData.DEV_MODE) {
      const results = searchReports(kw).filter(r => r.status === 'confirmed' && r.role === this.data.activeTab);
      this.setData({ reports: results });
    } else {
      // TODO: 真实模式搜索
      wx.showToast({ title: '搜索功能需接入后端', icon: 'none' });
    }
  },

  /** 跳转举报表单 */
  goReport() {
    const loggedIn = getApp().globalData.isLoggedIn;
    if (!loggedIn && !getApp().globalData.DEV_MODE) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.navigateTo({ url: '/pages/blacklist-report/blacklist-report' });
  },

  /** 查看详情 */
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/blacklist-detail/blacklist-detail?id=${id}` });
  },

  /** 转发 */
  onShare() {
    // 触发小程序分享
  },

  /** 页面分享配置 */
  onShareAppMessage() {
    return {
      title: '猫录助手 · 领养黑名单',
      path: '/pages/blacklist/blacklist',
      imageUrl: '',
    };
  },
});
