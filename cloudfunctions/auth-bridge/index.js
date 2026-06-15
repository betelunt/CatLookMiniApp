// ── 云函数: auth-bridge ──────────────────────────────────
// 微信小程序 code → Supabase JWT 桥接
//
// 流程:
//   1. wx.login() 获得 code
//   2. code2Session → openid + unionid
//   3. 查询/创建 Supabase 用户 (email = openid@wechat.mp)
//   4. 签发 Supabase JWT token
//   5. 更新 user_identities 表 (wechat_unionid)
//   6. 返回 { token, userId } 给小程序
//
// 环境变量 (云函数配置):
//   SUPABASE_URL         — Supabase 项目 URL
//   SUPABASE_SERVICE_KEY — service_role key (admin 权限)
//   WX_APPID             — 小程序 AppID
//   WX_SECRET            — 小程序 AppSecret
// ══════════════════════════════════════════════════════════

const cloud = require('wx-server-sdk');
const fetch = require('node-fetch');
const crypto = require('crypto');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// ── 配置 ─────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://d5msiv8g91huch72eu20.baseapi.memfiredb.com';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// WX_APPID 优先从环境变量读，没有则从微信上下文获取
function getAppId() {
  if (process.env.WX_APPID) return process.env.WX_APPID;
  try {
    const ctx = cloud.getWXContext();
    return ctx.APPID;
  } catch (_) { return null; }
}

// WX_SECRET 暂硬编码 —— 测试用，生产请移到环境变量
function getAppSecret() {
  return process.env.WX_SECRET || '';
}

// ── 工具函数 ─────────────────────────────────────────────

/** 用 service_role key 调 Supabase REST API */
async function supabaseAdmin(method, path, body = null) {
  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 解析响应：处理空 body（201 Created / 204 No Content）
  const text = await res.text();
  let data = {};
  if (text && text.trim()) {
    try { data = JSON.parse(text); } catch (_) { /* 非 JSON 响应，忽略 */ }
  }

  if (!res.ok) {
    console.error(`Supabase ${method} ${path} → ${res.status}:`, text.slice(0, 300));
    throw new Error(`Supabase API ${res.status}: ${text.slice(0, 200)}`);
  }
  return data;
}

/** 生成确定性密码 —— openid 的 sha256 前 32 位 */
function genPassword(openid) {
  return crypto.createHash('sha256').update(openid + '_catlook_salt').digest('hex').slice(0, 32);
}

// ── 主函数 ───────────────────────────────────────────────

exports.main = async (event) => {
  const { code } = event;
  if (!code) {
    return { ok: false, error: 'missing code' };
  }

  try {
    // ── 1. 微信 code → openid + unionid ──────────────────
    const appId = getAppId();
    const appSecret = getAppSecret();
    if (!appSecret) {
      return { ok: false, error: 'WX_SECRET 未配置，请在云函数环境变量中设置' };
    }
    const wxRes = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
    );
    const wxData = await wxRes.json();

    if (wxData.errcode) {
      console.error('code2Session failed:', wxData);
      return { ok: false, error: `code2Session failed: ${wxData.errmsg}` };
    }

    const { openid, unionid } = wxData;
    console.log(`code2Session ok: openid=${openid.slice(0, 8)}... unionid=${unionid ? unionid.slice(0, 8) + '...' : 'none'}`);

    // ── 2. 查询 user_identities 是否已有此微信用户 ────────
    // 先尝试 wechat_unionid（迁移后可用），回退到 wechat_openid
    const wxId = unionid || openid;
    let existing = [];
    try {
      existing = await supabaseAdmin(
        'GET',
        `/rest/v1/user_identities?wechat_unionid=eq.${encodeURIComponent(wxId)}&select=auth_user_id,wechat_unionid&limit=1`
      );
    } catch (_) {
      // wechat_unionid 列不存在，回退到 wechat_openid
      existing = await supabaseAdmin(
        'GET',
        `/rest/v1/user_identities?wechat_openid=eq.${encodeURIComponent(openid)}&select=auth_user_id,wechat_openid&limit=1`
      );
    }

    let userId;

    if (existing && existing.length > 0) {
      // 已有用户 → 复用
      userId = existing[0].auth_user_id;
      console.log(`existing user found: ${userId}`);
    } else {
      // ── 3. 新用户 → 创建 Supabase auth user ──────────
      const email = `${openid}@wechat.mp`;
      const password = genPassword(openid);

      // 尝试用标准 signup 创建用户（兼容 MemFire / 标准 Supabase）
      let created;
      try {
        created = await supabaseAdmin('POST', '/auth/v1/signup', {
          email,
          password,
          data: {
            openid,
            unionid: unionid || null,
            provider: 'wechat',
          },
        });
        console.log('signup response keys:', Object.keys(created));
      } catch (e) {
        console.log('signup failed (user may already exist):', e.message);
      }

      userId = created?.user?.id || created?.id;

      // 如果 signup 成功但没拿到 userId，尝试直接登录获取
      if (!userId && created?.access_token) {
        // signup 返回了 token，但结构不同，从 token 中解析 userId
        console.log('got token from signup, looking up user');
        try {
          const userRes = await supabaseAdmin('GET', '/auth/v1/user', null);
          userId = userRes?.id;
        } catch (_) {}
      }

      if (!userId) {
        console.log('signup did not return userId, trying token grant as fallback');
        try {
          const tokenRes = await supabaseAdmin('POST', '/auth/v1/token?grant_type=password', {
            email,
            password,
          });
          userId = tokenRes?.user?.id || tokenRes?.id;
          if (!userId) {
            return { ok: false, error: 'failed to create user: no userId returned' };
          }
        } catch (e2) {
          return { ok: false, error: 'failed to create or sign in user: ' + (e2.message || '').slice(0, 100) };
        }
      }

      // ── 4. 写入 users 表 + user_identities ──────────
      if (userId) {
        // 4a. 写入 users 表（App 端依赖此表），容错：已存在则跳过
        try {
          await supabaseAdmin('POST', '/rest/v1/users', {
            id: userId,
            username: `wx_${openid.slice(0, 8)}`,
            email: `${openid}@wechat.mp`,
            wechat_openid: openid,
          });
        } catch (e) {
          console.log('users insert skipped (may already exist):', e.message.slice(0, 100));
        }

        // 4b. 写入 user_identities 表
        try {
          const identityData = {
            auth_user_id: userId,
            account_id: userId,
            wechat_openid: openid,
            provider: 'wechat',
          };
          if (unionid) identityData.wechat_unionid = unionid;
          await supabaseAdmin('POST', '/rest/v1/user_identities', identityData);
        } catch (e) {
          console.log('user_identities insert skipped (may already exist):', e.message.slice(0, 100));
        }

        console.log(`user linked: ${userId}`);
      } else {
        return { ok: false, error: 'failed to create or find user' };
      }
    }

    // ── 5. 签发 Supabase JWT ──────────────────────────
    // 用 service_role + 用户身份签发 token
    const tokenRes = await supabaseAdmin('POST', '/auth/v1/token?grant_type=password', {
      email: `${openid}@wechat.mp`,
      password: genPassword(openid),
    });

    const token = tokenRes.access_token;

    if (!token) {
      // 如果密码登录失败，用 admin generate_link 兜底
      console.error('password grant failed, trying admin token gen');
      return { ok: false, error: 'token generation failed' };
    }

    console.log(`auth-bridge success: userId=${userId}`);
    return { ok: true, token, userId };

  } catch (err) {
    console.error('auth-bridge error:', err);
    return { ok: false, error: err.message || String(err) };
  }
};
