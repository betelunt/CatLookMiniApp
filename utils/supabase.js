// ── Supabase REST API 封装 ────────────────────────────────
// 小程序不使用 @supabase/supabase-js，直接用 wx.request

const SUPABASE_URL = 'https://d5msiv8g91huch72eu20.baseapi.memfiredb.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImV4cCI6MzM0NTYwMjY4NSwiaWF0IjoxNzY4ODAyNjg1LCJpc3MiOiJzdXBhYmFzZSJ9.GDhwj8464VwuX2hOoqbiPpn2er4X9Ytlt2LdqRSUDAo';

let _token = null;

/** 识别无效 token（mock token, 过期 token 等） */
function isValidToken(t) {
  if (!t) return false;
  // 过滤掉 DEV_MODE 的 mock token
  if (t.startsWith('dev-mock-token-')) return false;
  return true;
}

function initSupabase() {
  const raw = wx.getStorageSync('supabase_token');
  if (isValidToken(raw)) {
    _token = raw;
  } else {
    // 清除无效缓存，避免 401
    _token = null;
    if (raw) wx.removeStorageSync('supabase_token');
  }
}

/** 设置 auth token（用于后续请求的 Authorization header） */
function setToken(token) {
  _token = token;
}

/** 通用请求方法（返回 { data, headers }） */
function request(method, path, { body, params, auth = true, extraHeaders = {} } = {}) {
  return new Promise((resolve, reject) => {
    const header = {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
    // 只发送有效的 token
    if (auth && isValidToken(_token)) {
      header['Authorization'] = `Bearer ${_token}`;
    }

    // Build URL with query params
    let url = `${SUPABASE_URL}/rest/v1${path}`;
    if (params) {
      const qs = Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      if (qs) url += '?' + qs;
    }

    wx.request({
      url,
      method,
      header,
      data: body,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data: res.data, headers: res.header || {} });
        } else if (res.statusCode === 401) {
          _token = null;
          wx.removeStorageSync('supabase_token');
          reject({ status: 401, message: res.data });
        } else {
          reject({ status: res.statusCode, message: res.data });
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

// ── 便捷方法 ──

/**
 * SELECT
 *   count: 'exact' → 返回 { data, totalCount } 对象
 *   默认 → 返回数据数组（向后兼容）
 */
function select(table, { columns = '*', filters = {}, limit, offset, order, publicRead = false, count } = {}) {
  const qs = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      qs.push(`${encodeURIComponent(key)}=eq.${encodeURIComponent(value)}`);
    }
  }

  if (columns !== '*') qs.push(`select=${encodeURIComponent(columns)}`);
  if (limit)  qs.push(`limit=${limit}`);
  if (offset) qs.push(`offset=${offset}`);
  if (order)  qs.push(`order=${encodeURIComponent(order.column)}.${order.direction || 'asc'}`);

  const extraHeaders = {};
  if (count === 'exact') {
    extraHeaders['Prefer'] = 'count=exact';
  }

  const reqPath = `/${table}` + (qs.length > 0 ? '?' + qs.join('&') : '');
  return request('GET', reqPath, { auth: !publicRead, extraHeaders }).then(res => {
    if (count === 'exact') {
      const contentRange = res.headers['content-range'] || res.headers['Content-Range'] || '';
      const total = contentRange ? parseInt(contentRange.split('/').pop(), 10) : (res.data || []).length;
      return { data: res.data || [], totalCount: total };
    }
    return res.data;
  });
}

/** INSERT single row */
function insert(table, data) {
  return request('POST', `/${table}`, {
    body: data,
    params: { return: 'representation' },
  }).then(r => r.data);
}

/** UPDATE */
function update(table, id, data) {
  return request('PATCH', `/${table}?id=eq.${id}`, { body: data }).then(r => r.data);
}

/** DELETE */
function remove(table, id) {
  return request('DELETE', `/${table}?id=eq.${id}`).then(r => r.data);
}

/** 上传文件到 Supabase Storage */
function uploadFile(bucket, path, filePath) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager();
    const data = fs.readFileSync(filePath);

    wx.request({
      url: `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
      method: 'POST',
      header: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${_token}`,
        'Content-Type': 'image/jpeg',
      },
      data,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: reject,
    });
  });
}

/**
 * 获取 Supabase Storage 图片的缩略图 URL
 * MemFire 兼容 Supabase Storage 的 image transformation
 * @param {string} originalUrl - 原始图片 URL
 * @param {number} width - 宽度（px），高度自动等比缩放
 * @returns {string} 带缩略参数的 URL
 */
function getThumbUrl(originalUrl, width = 200) {
  if (!originalUrl) return '';
  // 跳过已经是 data URI 或微信临时路径
  if (originalUrl.startsWith('data:') || originalUrl.startsWith('wxfile://') || originalUrl.startsWith('http://tmp/')) {
    return originalUrl;
  }
  // 如果已经是 Supabase Storage URL，追加 transformation 参数
  if (originalUrl.includes('/storage/v1/object/')) {
    // Supabase image transformation: ?width=200&quality=80
    const sep = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${sep}width=${width}&quality=75`;
  }
  return originalUrl;
}

module.exports = {
  SUPABASE_URL,
  initSupabase,
  setToken,
  request,
  select,
  insert,
  update,
  remove,
  uploadFile,
  getThumbUrl,
};
