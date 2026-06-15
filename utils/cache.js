// ── 客户端缓存工具 ────────────────────────────────────
// 基于 wx.Storage 的 TTL 缓存，减少 Supabase API 调用次数
//
// 缓存策略：
//   - 列表数据（cats 列表等）: TTL 60 秒
//   - 详情数据（单条 cat）: TTL 120 秒
//   - 用户主动下拉刷新时跳过缓存

const CACHE_PREFIX = 'cl_';

/** 存入缓存 */
function cacheSet(key, data, ttlSeconds = 60) {
  const entry = {
    data,
    expires: Date.now() + ttlSeconds * 1000,
  };
  try {
    wx.setStorageSync(CACHE_PREFIX + key, entry);
  } catch (e) {
    // storage 满了就清掉过期缓存再试一次
    cleanExpired();
    try {
      wx.setStorageSync(CACHE_PREFIX + key, entry);
    } catch (_) { /* 静默 */ }
  }
}

/** 读缓存（过期返回 null） */
function cacheGet(key) {
  try {
    const entry = wx.getStorageSync(CACHE_PREFIX + key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      wx.removeStorageSync(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch (_) {
    return null;
  }
}

/** 清除某个缓存 */
function cacheRemove(key) {
  try {
    wx.removeStorageSync(CACHE_PREFIX + key);
  } catch (_) {}
}

/** 清除所有过期缓存 */
function cleanExpired() {
  try {
    const info = wx.getStorageInfoSync();
    const now = Date.now();
    for (const k of info.keys) {
      if (!k.startsWith(CACHE_PREFIX)) continue;
      const entry = wx.getStorageSync(k);
      if (entry && entry.expires && now > entry.expires) {
        wx.removeStorageSync(k);
      }
    }
  } catch (_) {}
}

module.exports = { cacheSet, cacheGet, cacheRemove, cleanExpired };
