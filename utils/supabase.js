// ── Supabase REST API 封装 ────────────────────────────────
// 小程序不使用 @supabase/supabase-js，直接用 wx.request

const SUPABASE_URL = 'https://d5msiv8g91huch72eu20.baseapi.memfiredb.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImV4cCI6MzM0NTYwMjY4NSwiaWF0IjoxNzY4ODAyNjg1LCJpc3MiOiJzdXBhYmFzZSJ9.GDhwj8464VwuX2hOoqbiPpn2er4X9Ytlt2LdqRSUDAo';

let _token = null;

function initSupabase() {
  _token = wx.getStorageSync('supabase_token') || null;
}

/** 设置 auth token（用于后续请求的 Authorization header） */
function setToken(token) {
  _token = token;
}

/** 通用请求方法 */
function request(method, path, { body, params, auth = true } = {}) {
  return new Promise((resolve, reject) => {
    const header = {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    };
    if (auth && _token) {
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
          resolve(res.data);
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

/** SELECT */
function select(table, { columns = '*', filters = {}, limit, offset, order } = {}) {
  const qs = [];

  // PostgREST filter: key=eq.value
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      qs.push(`${encodeURIComponent(key)}=eq.${encodeURIComponent(value)}`);
    }
  }

  // select columns
  if (columns !== '*') qs.push(`select=${encodeURIComponent(columns)}`);

  // pagination
  if (limit)  qs.push(`limit=${limit}`);
  if (offset) qs.push(`offset=${offset}`);

  // ordering
  if (order)  qs.push(`order=${encodeURIComponent(order.column)}.${order.direction || 'asc'}`);

  const path = `/${table}` + (qs.length > 0 ? '?' + qs.join('&') : '');
  return request('GET', path);
}

/** INSERT single row */
function insert(table, data) {
  return request('POST', `/${table}`, {
    body: data,
    params: { return: 'representation' },
  });
}

/** UPDATE */
function update(table, id, data) {
  return request('PATCH', `/${table}?id=eq.${id}`, { body: data });
}

/** DELETE */
function remove(table, id) {
  return request('DELETE', `/${table}?id=eq.${id}`);
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
};
