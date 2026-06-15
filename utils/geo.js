// ── 城市解析工具 ──────────────────────────────────────
// 调用云函数 geo-to-city 批量逆地理编码
// 客户端侧缓存：已解析的坐标存 wx.Storage，跨会话复用

const GEO_CACHE_KEY = 'geo_city_cache';

/** 从本地缓存读取已解析的城市映射 */
function loadCache() {
  try {
    return wx.getStorageSync(GEO_CACHE_KEY) || {};
  } catch (_) {
    return {};
  }
}

/** 保存城市映射到本地缓存 */
function saveCache(map) {
  try {
    wx.setStorageSync(GEO_CACHE_KEY, map);
  } catch (_) {}
}

/**
 * 批量解析坐标 → 城市名
 * @param {Array<{lat:number, lng:number}>} coords 坐标数组
 * @returns {Promise<Map<string, string>>} "lat,lng" → city
 */
async function resolveCities(coords) {
  const cache = loadCache();
  const result = new Map(Object.entries(cache));

  // 过滤出未缓存的坐标
  const missing = coords.filter(c => {
    if (!c.lat || !c.lng) return false;
    const key = `${c.lat},${c.lng}`;
    return !result.has(key);
  });

  if (missing.length === 0) return result;

  try {
    const res = await wx.cloud.callFunction({
      name: 'geo-to-city',
      data: { coords: missing },
    });

    if (res.result && res.result.ok) {
      for (const { lat, lng, city } of res.result.cities) {
        if (city) {
          const key = `${lat},${lng}`;
          result.set(key, city);
          cache[key] = city;
        }
      }
      saveCache(cache);
    }
  } catch (e) {
    console.error('geo resolve failed:', e);
  }

  return result;
}

/**
 * 给猫咪列表补充城市名
 * @param {Array} cats 猫咪数组（每个含 latitude/longitude/city 字段）
 * @returns {Array} 补充了 city 字段的猫咪数组
 */
async function fillCities(cats) {
  if (!cats || cats.length === 0) return cats;

  // 收集需要解析的坐标（有经纬度但没城市的）
  const needResolve = cats.filter(c => c.latitude && c.longitude && !c.city);
  if (needResolve.length === 0) return cats;

  const cityMap = await resolveCities(
    needResolve.map(c => ({ lat: c.latitude, lng: c.longitude }))
  );

  return cats.map(c => {
    if (c.city) return c;  // 已有城市名，不动
    if (!c.latitude || !c.longitude) return c;
    const key = `${c.latitude},${c.longitude}`;
    const city = cityMap.get(key);
    return city ? { ...c, city } : c;
  });
}

module.exports = { fillCities };
