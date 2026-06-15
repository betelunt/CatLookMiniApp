// 合规与安全 — 用户协议 + 隐私政策
Page({
  data: {
    activeTab: 'terms', // 'terms' | 'privacy'
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },
});
