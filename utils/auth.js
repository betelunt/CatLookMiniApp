// ── Auth 工具 ─────────────────────────────────────────────

/** 获取缓存的 token 和 userId */
function getToken() {
  try {
    const token = wx.getStorageSync('supabase_token');
    const userId = wx.getStorageSync('user_id');
    return token ? { token, userId } : null;
  } catch (e) {
    return null;
  }
}

/** 检查是否已登录 */
function checkLogin() {
  return !!getToken();
}

/** 确保已登录，否则跳转登录页 */
function requireLogin() {
  if (!checkLogin()) {
    wx.navigateTo({ url: '/pages/login/login' });
    return false;
  }
  return true;
}

module.exports = { getToken, checkLogin, requireLogin };
