// 我的举报
const { getMyReports } = require('../../data/blacklist');

const STATUS_MAP = {
  pending: { label: '审核中', color: '#FF9800' },
  confirmed: { label: '已确认', color: '#F44336' },
  rejected: { label: '已驳回', color: '#999999' },
};

const ROLE_LABEL = {
  adopter: '领养人',
  rescuer: '送养人',
};

Page({
  data: {
    reports: [],
    loading: true,
    statusMap: STATUS_MAP,
    roleLabel: ROLE_LABEL,
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  async loadData() {
    this.setData({ loading: true });
    try {
      if (getApp().globalData.DEV_MODE) {
        await new Promise(r => setTimeout(r, 300));
      }
      const reports = await getMyReports();
      this.setData({ reports: reports || [], loading: false });
    } catch (err) {
      console.error('加载我的举报失败:', err);
      this.setData({ loading: false });
    }
  },

  /** 查看详情 */
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/blacklist-detail/blacklist-detail?id=${id}` });
  },

  /** 去举报 */
  goReport() {
    wx.navigateTo({ url: '/pages/blacklist-report/blacklist-report' });
  },
});
