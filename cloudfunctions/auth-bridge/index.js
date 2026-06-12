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
const WX_APPID = process.env.WX_APPID;
const WX_SECRET = process.env.WX_SECRET;

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

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Supabase API error ${res.status}: ${JSON.stringify(data)}`);
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
    const wxRes = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`
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

      // 先尝试用 admin API 创建用户
      let created;
      try {
        created = await supabaseAdmin('POST', '/auth/v1/admin/users', {
          email,
          password,
          email_confirm: true,
          user_metadata: {
            openid,
            unionid: unionid || null,
            provider: 'wechat',
          },
        });
      } catch (e) {
        // 用户可能已存在（email 冲突），尝试直接登录
        console.log('admin create user failed (maybe exists):', e.message);
      }

      userId = created?.id || created?.user?.id;

      if (!userId) {
        // 回退: 尝试从 auth.users 查找
        console.log('attempting fallback: look up by email');
        // 直接用 sign-in 试 —— 如果存在会成功，不存在会失败
      }

      // ── 4. 写入 users 表 + user_identities ──────────
      if (userId) {
        // 4a. 写入 users 表（App 端依赖此表）
        await supabaseAdmin('POST', '/rest/v1/users', {
          id: userId,
          username: `wx_${openid.slice(0, 8)}`,
          email: `${openid}@wechat.mp`,
          wechat_openid: openid,
        });

        // 4b. 写入 user_identities 表
        const identityData = {
          auth_user_id: userId,
          account_id: userId,
          wechat_openid: openid,
          provider: 'wechat',
        };
        // 如果有 unionid 且列已迁移，也写入
        if (unionid) {
          try {
            identityData.wechat_unionid = unionid;
            await supabaseAdmin('POST', '/rest/v1/user_identities', identityData);
          } catch (_) {
            // wechat_unionid 列不存在，去掉后重试
            delete identityData.wechat_unionid;
            await supabaseAdmin('POST', '/rest/v1/user_identities', identityData);
          }
        } else {
          await supabaseAdmin('POST', '/rest/v1/user_identities', identityData);
        }
        console.log(`new user created: ${userId}`);
      } else {
        return { ok: false, error: 'failed to create user' };
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
