// ── 黑名单 Mock 数据 & API ──────────────────────────────
// DEV_MODE=true 时使用本地数据，false 时调用 Supabase

const { select, insert, update } = require('../utils/supabase');

const STORAGE_KEY = 'dev_blacklist';
const STORAGE_PENDING_KEY = 'dev_blacklist_pending';

// ── 快捷分类标签 ─────────────────────────────────────────

const BLACKLIST_CATEGORIES = {
  adopter: [
    '虐猫',
    '弃养不送回',
    '丢失不寻找',
    '领养后转卖',
    '拒绝回访',
    '拉黑送养人',
  ],
  rescuer: [
    '骗押金',
    '疑似商家',
    '疑似猫舍',
    '盗用猫咪照片',
    '猫咪信息严重不符',
  ],
};

// ── 种子数据 ─────────────────────────────────────────────

const SEED_REPORTS = [
  {
    id: 'bl-001',
    role: 'adopter',
    real_name: '张三',
    gender: 'male',
    wechat_nickname: '小猫杀手',
    phone: '138****1234',
    wechat_id: 'zhangsan_killer',
    city: '北京',
    category: '虐猫',
    description: '2026年3月领养了一只橘猫，4月底猫咪被发现遗弃在小区垃圾桶旁，身上有明显外伤。经多名目击者证实，此人在家中对猫咪施虐。',
    evidence_urls: [],
    reporter_name: '李救助',
    reporter_wx: 'li_rescue_001',
    reporter_phone: '139****5678',
    status: 'confirmed',
    confirmations: [
      { name: '王邻居', wx: 'wang_neighbor', note: '亲眼看到他家猫咪受伤，曾劝过他不听' },
      { name: '赵义工', wx: 'zhao_volunteer', note: '这只猫是我们救助站送的，后来跟踪回访发现情况不对' },
    ],
    created_at: '2026-04-25T10:00:00Z',
  },
  {
    id: 'bl-002',
    role: 'adopter',
    real_name: '刘某某',
    gender: 'female',
    wechat_nickname: '爱猫人士刘',
    phone: '159****0000',
    wechat_id: 'catlover_liu',
    city: '上海',
    category: '弃养不送回',
    description: '领养了一只英短蓝猫，3个月后以"搬家不方便养"为由弃养，且拒绝将猫送回原救助人。猫咪至今下落不明。',
    evidence_urls: [],
    reporter_name: '陈救助',
    reporter_wx: 'chen_rescue',
    reporter_phone: '136****1111',
    status: 'confirmed',
    confirmations: [],
    created_at: '2026-05-10T08:30:00Z',
  },
  {
    id: 'bl-003',
    role: 'rescuer',
    real_name: '某猫舍',
    gender: 'male',
    wechat_nickname: '名猫世家',
    phone: '185****2222',
    wechat_id: 'mingmao888',
    city: '广州',
    category: '疑似猫舍',
    description: '此人以"免费领养"名义在多个领养群发布品种猫信息，实际为后院猫舍冒充个人救助。多只猫咪领养后发现有严重基因病。',
    evidence_urls: [],
    reporter_name: '林义工',
    reporter_wx: 'lin_yigong',
    reporter_phone: '177****3333',
    status: 'confirmed',
    confirmations: [
      { name: '黄领养人', wx: 'huang_adopter', note: '我从他那里领的布偶猫，到家一周就查出心脏病' },
    ],
    created_at: '2026-05-20T14:00:00Z',
  },
  {
    id: 'bl-004',
    role: 'adopter',
    real_name: '孙某',
    gender: 'male',
    wechat_nickname: '喵星人爱好者',
    city: '深圳',
    category: '领养后转卖',
    description: '从多个救助人手中领养品种猫后，在闲鱼上以高价转卖。目前已确认至少3只猫被他转卖获利。',
    evidence_urls: [],
    reporter_name: '周救助',
    reporter_wx: 'zhou_help',
    reporter_phone: '133****4444',
    status: 'pending',
    confirmations: [],
    created_at: '2026-06-02T09:15:00Z',
  },
  {
    id: 'bl-005',
    role: 'rescuer',
    real_name: '某宠物店',
    gender: 'female',
    wechat_nickname: '爱心猫屋',
    wechat_id: 'aixinmaowu',
    city: '杭州',
    category: '骗押金',
    description: '以"领养需要押金，绝育后退还"为由收取500-2000元不等的押金，但猫咪均未做过绝育，押金也不退还。已有5位领养人受骗。',
    evidence_urls: [],
    reporter_name: '吴救助',
    reporter_wx: 'wu_rescue',
    reporter_phone: '188****5555',
    status: 'confirmed',
    confirmations: [
      { name: '被骗的小张', wx: 'zhang_adopt', note: '交了1000押金，都一年了也没退，猫也没绝育' },
      { name: '被骗的小李', wx: 'li_adopt', note: '同样遭遇，押金800' },
    ],
    created_at: '2026-05-15T16:45:00Z',
  },
];

// ── 本地缓存读写 ─────────────────────────────────────────

function loadLocal() {
  try { return wx.getStorageSync(STORAGE_KEY) || []; }
  catch (e) { return []; }
}

function saveLocal(reports) {
  wx.setStorageSync(STORAGE_KEY, reports);
}

function loadPending() {
  try { return wx.getStorageSync(STORAGE_PENDING_KEY) || []; }
  catch (e) { return []; }
}

function savePending(reports) {
  wx.setStorageSync(STORAGE_PENDING_KEY, reports);
}

/** 合并全部黑名单：种子 + 用户提交的（含 pending） */
function getAllReports() {
  const local = loadLocal();
  const localIds = new Set(local.map(r => String(r.id)));
  const seeds = SEED_REPORTS.filter(r => !localIds.has(String(r.id)));
  return [...local, ...seeds].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/** 已确认的黑名单列表（公开展示） */
function getConfirmedReports(role) {
  const all = getAllReports();
  const confirmed = all.filter(r => r.status === 'confirmed');
  if (role) return confirmed.filter(r => r.role === role);
  return confirmed;
}

/** 提交举报 → DEV_MODE 下存本地 */
async function submitReport(data) {
  if (getApp().globalData.DEV_MODE) {
    const local = loadLocal();
    const newReport = {
      ...data,
      id: 'bl-' + Date.now(),
      status: 'pending',
      confirmations: [],
      created_at: new Date().toISOString(),
    };
    local.unshift(newReport);
    saveLocal(local);

    // 记录"我提交的"举报 ID
    const myIds = wx.getStorageSync('dev_my_report_ids') || [];
    myIds.unshift(newReport.id);
    wx.setStorageSync('dev_my_report_ids', myIds);

    return newReport;
  }
  // 真实模式：调用 Supabase
  return await insert('blacklist_reports', data);
}

/** 我的举报（DEV_MODE 下按提交记录匹配，真实模式按用户 ID 过滤） */
async function getMyReports() {
  if (getApp().globalData.DEV_MODE) {
    const myIds = wx.getStorageSync('dev_my_report_ids') || [];
    if (myIds.length === 0) return [];
    const all = getAllReports();
    return myIds.map(id => all.find(r => String(r.id) === String(id))).filter(Boolean);
  }
  // 真实模式
  const userId = getApp().globalData.userId;
  if (!userId) return [];
  return await select('blacklist_reports', {
    columns: 'id,reported_name,reported_wx,role,category,status,created_at',
    filters: { reporter_wx: userId },
    order: { column: 'created_at', direction: 'desc' },
    limit: 30,
  });
}

/** 帮忙证实 */
async function addConfirmation(reportId, confirmation) {
  if (getApp().globalData.DEV_MODE) {
    const local = loadLocal();
    const idx = local.findIndex(r => String(r.id) === String(reportId));
    if (idx !== -1) {
      if (!local[idx].confirmations) local[idx].confirmations = [];
      local[idx].confirmations.push(confirmation);
      saveLocal(local);
      return local[idx];
    }
    // 种子数据的也存到本地做覆盖
    const seed = SEED_REPORTS.find(r => String(r.id) === String(reportId));
    if (seed) {
      const copy = { ...seed, confirmations: [...(seed.confirmations || []), confirmation] };
      local.unshift(copy);
      saveLocal(local);
      return copy;
    }
    return null;
  }
  // 真实模式
  const existing = await select('blacklist_reports', { filters: { id: reportId } });
  if (!existing || existing.length === 0) return null;
  const confirmations = [...(existing[0].confirmations || []), confirmation];
  return await update('blacklist_reports', reportId, { confirmations });
}

/** 查询 - 按昵称/手机号搜索 */
function searchReports(keyword) {
  const all = getConfirmedReports();
  if (!keyword) return all;
  const kw = keyword.toLowerCase();
  return all.filter(r => {
    const fields = [r.real_name, r.wechat_nickname, r.phone, r.wechat_id, r.category, r.city];
    return fields.some(f => f && String(f).toLowerCase().includes(kw));
  });
}

module.exports = {
  BLACKLIST_CATEGORIES,
  SEED_REPORTS,
  getAllReports,
  getConfirmedReports,
  getMyReports,
  submitReport,
  addConfirmation,
  searchReports,
};
