// ── 云函数: generate-wxacode ──────────────────────────────
// 生成分享用小程序码
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const { cat_id } = event;

  // 1. 调用 wxacode.getUnlimited({ scene: `cat_id=${cat_id}`, page: 'pages/adoption-detail/adoption-detail' })
  // 2. 上传小程序码图片到 Supabase Storage
  // 3. 返回图片 URL

  return { url: '...' };
};
