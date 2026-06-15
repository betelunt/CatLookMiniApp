// ── 云函数: geo-to-city ──────────────────────────────────
// 批量逆地理编码：经纬度 → 城市名
//
// 环境变量:
//   TENCENT_MAP_KEY — 腾讯地图 WebService API Key
//
// 输入: { coords: [{lat, lng}, ...] }
// 输出: { cities: [{lat, lng, city}, ...] }
//
// 隐私保护: 仅返回省+市，绝不返回街道/门牌号
// ══════════════════════════════════════════════════════════

const cloud = require('wx-server-sdk');
const fetch = require('node-fetch');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const MAP_KEY = process.env.TENCENT_MAP_KEY;
const API = 'https://apis.map.qq.com/ws/geocoder/v1/';

// 内存缓存（云函数实例保活期间复用）
const cache = new Map();

/** 获取城市名（省+市级别，不含更细粒度信息） */
async function reverseGeocode(lat, lng) {
  const cacheKey = `${lat},${lng}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const url = `${API}?location=${lat},${lng}&key=${MAP_KEY}&get_poi=0`;
  const res = await fetch(url);
  const json = await res.json();

  let city = '';
  if (json.status === 0 && json.result) {
    const ad = json.result.ad_info || {};
    const comp = json.result.address_component || {};

    // 省份
    const province = ad.province || comp.province || '';
    // 城市（地级市优先，没有则用省份）
    const cityName = ad.city || comp.city || '';

    if (cityName && cityName !== province) {
      city = cityName;  // e.g. "广州市"
    } else if (province) {
      city = province;  // 直辖市: "北京市"
    } else {
      city = '未知';
    }
  } else {
    city = '未知';
  }

  cache.set(cacheKey, city);
  return city;
}

// ── 主函数 ───────────────────────────────────────────────

exports.main = async (event) => {
  const { coords } = event;
  if (!coords || !Array.isArray(coords) || coords.length === 0) {
    return { ok: false, error: 'missing coords array' };
  }
  if (!MAP_KEY) {
    return { ok: false, error: 'TENCENT_MAP_KEY not configured' };
  }

  try {
    // 限流：每次最多 50 个坐标
    const batch = coords.slice(0, 50);

    const cities = await Promise.all(
      batch.map(async ({ lat, lng }) => {
        if (!lat || !lng) return { lat, lng, city: '' };
        const city = await reverseGeocode(lat, lng);
        return { lat, lng, city };
      })
    );

    console.log(`geo-to-city: resolved ${cities.length} coords, cache size=${cache.size}`);
    return { ok: true, cities };

  } catch (err) {
    console.error('geo-to-city error:', err);
    return { ok: false, error: err.message || String(err) };
  }
};
