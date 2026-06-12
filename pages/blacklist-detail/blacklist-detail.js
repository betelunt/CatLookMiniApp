// 黑名单详情页
const { SEED_REPORTS, addConfirmation } = require('../../data/blacklist');

Page({
  data: {
    report: null,
    loading: true,
    showConfirmForm: false,
    confirmName: '',
    confirmNote: '',
    confirming: false,
  },

  onLoad(options) {
    const id = options.id;
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      wx.navigateBack();
      return;
    }
    this.loadDetail(id);
  },

  async loadDetail(id) {
    this.setData({ loading: true });
    try {
      let report;
      if (getApp().globalData.DEV_MODE) {
        await new Promise(r => setTimeout(r, 200));
        // 先从种子数据找
        report = SEED_REPORTS.find(r => String(r.id) === String(id));
        if (!report) {
          // 再从本地找
          const local = wx.getStorageSync('dev_blacklist') || [];
          report = local.find(r => String(r.id) === String(id));
        }
      } else {
        const { select } = require('../../utils/supabase');
        const results = await select('blacklist_reports', { filters: { id } });
        report = results && results[0];
      }

      if (!report) {
        wx.showToast({ title: '记录不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }

      this.setData({
        report,
        loading: false,
        confirmCount: (report.confirmations || []).length,
      });
    } catch (err) {
      console.error('加载详情失败:', err);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /** 预览证据图片 */
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const urls = this.data.report.evidence_urls || [];
    wx.previewImage({ current: url, urls });
  },

  /** 切换证实表单 */
  onToggleConfirmForm() {
    const loggedIn = getApp().globalData.isLoggedIn;
    if (!loggedIn && !getApp().globalData.DEV_MODE) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    this.setData({ showConfirmForm: !this.data.showConfirmForm });
  },

  onConfirmNameInput(e) { this.setData({ confirmName: e.detail.value }); },
  onConfirmNoteInput(e) { this.setData({ confirmNote: e.detail.value }); },

  /** 提交证实 */
  async onSubmitConfirm() {
    const { confirmName, confirmNote } = this.data;
    if (!confirmName.trim()) {
      wx.showToast({ title: '请输入您的称呼', icon: 'none' });
      return;
    }
    this.setData({ confirming: true });
    try {
      const confirmation = {
        name: confirmName.trim(),
        wx: getApp().globalData.userInfo?.nickName || '',
        note: confirmNote.trim(),
        at: new Date().toISOString(),
      };
      const updated = await addConfirmation(this.data.report.id, confirmation);
      if (updated) {
        wx.showToast({ title: '证实成功！感谢您的帮助', icon: 'success' });
        this.setData({
          report: updated,
          showConfirmForm: false,
          confirmName: '',
          confirmNote: '',
          confirmCount: (updated.confirmations || []).length,
        });
      } else {
        wx.showToast({ title: '操作失败', icon: 'none' });
      }
    } catch (err) {
      console.error('证实失败:', err);
      wx.showToast({ title: '网络错误', icon: 'none' });
    }
    this.setData({ confirming: false });
  },

  /** 拨打电话 */
  onCallPhone(e) {
    const phone = e.currentTarget.dataset.phone;
    if (phone && !phone.includes('*')) {
      wx.makePhoneCall({ phoneNumber: phone.replace(/[^\d]/g, '') });
    }
  },

  /** 分享 */
  onShareAppMessage() {
    const r = this.data.report;
    return {
      title: `黑名单曝光：${r.wechat_nickname || r.real_name || '未知'} - ${r.category}`,
      path: `/pages/blacklist-detail/blacklist-detail?id=${r.id}`,
      imageUrl: '',
    };
  },
});
