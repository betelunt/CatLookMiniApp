# 猫录助手 · 黑名单板块设计

**日期**: 2026-06-08  
**来源**: 用户需求 + 参考「宠物帮领养中心」小程序  
**状态**: 已确认

---

## 一、定位

保护猫咪，救助人举报不良领养人/送养人 → 平台审核后公示 → 提醒其他救助人避雷。

## 二、入口

「猫咪领养」(pages/adoption-list) 页面顶部 → **「黑名单」按钮** → pages/blacklist

## 三、页面清单（新增 3 个）

| 页面 | 路径 | 说明 |
|------|------|------|
| 黑名单主页 | `pages/blacklist` | 操作区 + 声明 + 领养人/送养人双Tab列表 |
| 黑名单详情 | `pages/blacklist-detail` | 失信人完整信息 + 证据 + 证实 |
| 举报表单 | `pages/blacklist-report` | 3步：失信人信息 → 举报理由 → 联系方式 |

## 四、黑名单主页 (pages/blacklist)

```
┌─────────────────────────────┐
│  [我要举报]   [查询]   [转发] │  ← 三个操作按钮
├─────────────────────────────┤
│ ⚠️ 以下信息由网友收集发布，   │
│   资料来自多方渠道，请大家    │
│   诚信交流，共建健康领养环境  │  ← 官方声明
├─────────────────────────────┤
│  [领养人黑名单] [送养人黑名单] │  ← Tab 切换
├─────────────────────────────┤
│  昵称  │ 举报原因 │ 详情     │
│  张三  │ 虐猫    │ 查看>   │
│  ...                       │
└─────────────────────────────┘
```

- **查询按钮**：弹出搜索框，支持昵称/手机号搜索
- **转发按钮**：分享小程序卡片到微信群/朋友圈
- **列表字段**：昵称、举报原因（显示快捷分类标签）、详情按钮

## 五、黑名单详情页 (pages/blacklist-detail)

### 标题
「失信人信息」

### 平台声明
> 以下信息真实性由发布者个人承担，如侵犯您的个人权益，请与我们联系

### 失信人信息表
| 字段 | 显示规则 |
|------|---------|
| 真实姓名 | 有则显示，无则隐藏 |
| 性别 | 显示 |
| 身份 | 领养人/送养人 |
| 所在地 | 显示城市 |
| 身份证号 | 打码显示（如 320***********1234）或无则隐藏 |
| 手机号 | 打码显示（如 138****1234）或无则隐藏 |
| 微信号 | 有则显示 |
| 微信昵称 | 有则显示 |

### 举报理由区域
- 快捷分类标签
- 详细文字描述
- 证据图片（最多9张，以聊天记录截图为主）

### 帮忙证实区域
- 有人证实：显示证实人头像+昵称+证实说明
- 无人证实：显示「暂无人帮忙证实」

### 底部按钮
- 「帮忙证实」（需登录）

## 六、举报表单 (pages/blacklist-report) — 3 步

### Step 1：失信人信息

| 字段 | 必填 | 类型 |
|------|------|------|
| 身份 | ✅ | 单选：领养人 / 送养人 |
| 性别 | ✅ | 单选：男 / 女 |
| 真实姓名 | 选填 | 文本 |
| 身份证号 | 选填 | 文本（加密存储） |
| 微信昵称 | 选填 | 文本 |
| 手机号 | 至少一项 | 文本 |
| 微信号 | 至少一项 | 文本 |
| 所在城市 | ✅ | picker region |
| 详细地址 | 选填 | 文本 |

### Step 2：举报理由（优化版）

**快捷分类**（必选，多选 TBD）：

| 举报领养人 | 举报送养人 |
|-----------|-----------|
| 虐猫 | 骗押金 |
| 弃养不送回 | 疑似商家 |
| 丢失不寻找 | 疑似猫舍 |
| 领养后转卖 | 盗用猫咪照片 |
| 拒绝回访 | 猫咪信息严重不符 |
| 拉黑送养人 | … |

> ⚠️ 分类标签为暂定，用户后续会整理完整版本替换。

**详细描述**（必填 ≥20字）：自由文字，列出具体事实。

**上传证据**（必填）：图片，最多 9 张。

### Step 3：联系方式

提示：「以下信息请务必填写，我们会联系您进行核实，如果联系不上，您举报的信息将会自动作废」

| 字段 | 必填 |
|------|------|
| 姓名 | ✅ |
| 微信号 | ✅ |
| 手机号 | ✅ |

## 七、审核机制

```
提交 → 待审核(pending) → 已确认(confirmed) → 公开展示
                       → 已驳回(rejected)  → 不展示
```

- 只有 `status = 'confirmed'` 的记录出现在黑名单列表中
- 审核在 Supabase 后台手动操作（本期不做审核后台，由开发者直接在数据库改状态）

## 八、数据库

### 新表：`blacklist_reports`

```sql
CREATE TABLE IF NOT EXISTS blacklist_reports (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role            TEXT NOT NULL CHECK (role IN ('adopter', 'rescuer')),
  real_name       TEXT,
  gender          TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  id_number       TEXT,
  wechat_nickname TEXT,
  phone           TEXT,
  wechat_id       TEXT,
  city            TEXT NOT NULL,
  address         TEXT,
  category        TEXT NOT NULL,
  description     TEXT NOT NULL,
  evidence_urls   JSONB DEFAULT '[]'::jsonb,
  reporter_name   TEXT NOT NULL,
  reporter_wx     TEXT NOT NULL,
  reporter_phone  TEXT NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  confirmations   JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT phone_or_wechat CHECK (
    (phone IS NOT NULL AND phone != '') OR (wechat_id IS NOT NULL AND wechat_id != '')
  )
);
```

## 九、权限

| 操作 | 权限 |
|------|------|
| 浏览黑名单列表 | 无需登录 |
| 查看详情 | 无需登录 |
| 举报 | 需登录 |
| 帮忙证实 | 需登录 |
| 审核（改状态） | 仅后台 |

---

**关联**：[[miniprogram-catlook-helper]]
