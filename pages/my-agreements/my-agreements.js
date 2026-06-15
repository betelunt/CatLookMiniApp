// 我的领养协议列表
Page({
  data: { agreements: [], loading: true },

  onShow() { this.loadAgreements(); },

  async loadAgreements() {
    const app = getApp();
    this.setData({ loading: true });

    if (app.globalData.DEV_MODE) {
      await new Promise(r => setTimeout(r, 300));
      this.setData({ agreements: [], loading: false });
      return;
    }

    // 真实 API: 从 Supabase 拉取当前用户的协议（限制 30 条）
    const { select } = require('../../utils/supabase');
    const agreements = await select('adoption_agreements', {
      columns: 'id,cat_id,blurred_url,status,created_at',
      filters: { rescuer_user_id: app.globalData.userId },
      order: { column: 'created_at', direction: 'desc' },
      limit: 30,
    });
    this.setData({ agreements: agreements || [], loading: false });
  },
});
