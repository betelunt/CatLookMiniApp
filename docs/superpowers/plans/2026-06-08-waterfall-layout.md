# 瀑布流布局改造 + 性别字段 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将猫咪档案和猫咪领养两个页面的单列横卡列表改为双列瀑布流竖卡，同时新增 gender 字段。

**Architecture:** JS 双数组交替分列 + Flex 两列布局，照片 aspectFill 自然形成高度差。性别用颜色区分（蓝男/粉女/灰未知），卡片信息精简为 1-2 行。

**Tech Stack:** 微信原生小程序 (WXML + WXSS + JS)，Mock 数据驱动

---

### Task 1: 新增 gender 常量 + 数据库迁移 SQL

**Files:**
- Modify: `utils/constants.js`
- Create: `database/migration_gender.sql`

- [ ] **Step 1: 在 constants.js 末尾添加 gender 相关常量**

在 `module.exports` 之前插入：

```js
/** 性别选项与颜色 */
const GENDER_OPTIONS = ['未知', '男孩', '女孩'];
const GENDER_VALUES = [null, 'male', 'female'];
const GENDER_COLORS = {
  'male': '#1976D2',
  'female': '#E91E63',
};
const GENDER_LABELS = {
  'male': '♂男孩',
  'female': '♀女孩',
};
```

更新 `module.exports` 添加四个新导出：

```js
module.exports = {
  BREEDS, CAT_STATUS, STATUS_COLORS, ADOPTION_STATUS,
  FOOD_CATEGORIES, SAFETY_LEVELS,
  GENDER_OPTIONS, GENDER_VALUES, GENDER_COLORS, GENDER_LABELS,
};
```

- [ ] **Step 2: 创建数据库迁移 SQL 文件**

`database/migration_gender.sql`:

```sql
-- 新增性别字段
ALTER TABLE cats ADD COLUMN gender TEXT;  -- 'male' | 'female' | NULL
COMMENT ON COLUMN cats.gender IS '性别: male=公, female=母, NULL=未知';
```

- [ ] **Step 3: Commit**

```bash
git add utils/constants.js database/migration_gender.sql
git commit -m "feat: add gender constants and migration SQL"
```

---

### Task 2: Mock 数据添加 gender 字段

**Files:**
- Modify: `data/mock.js`

- [ ] **Step 1: 给 6 只种子猫添加 gender 字段**

修改 `SEED_CATS` 数组，每只猫新增 `gender` 属性：

```js
const SEED_CATS = [
  { id:1,  name:'小花', breed:'橘猫',     city:'北京', health_status:'健康',   age:'2', is_neutered:true,  gender:'female', personality:'亲人、爱撒娇',     description:'橘色短毛，白色肚皮',       photo_url:'', adoption_status:'seeking', created_by:'00000000-0000-0000-0000-000000000001' },
  { id:2,  name:'小黑', breed:'黑猫',     city:'上海', health_status:'健康',   age:'1', is_neutered:false, gender:'male',   personality:'活泼好动',         description:'纯黑短毛，金色眼睛',         photo_url:'', adoption_status:'none',    created_by:'00000000-0000-0000-0000-000000000001' },
  { id:3,  name:'雪球', breed:'长毛白猫', city:'杭州', health_status:'恢复中', age:'3', is_neutered:true,  gender:'female', personality:'温柔安静',         description:'纯白长毛，蓝色眼睛',         photo_url:'', adoption_status:'adopted', created_by:'00000000-0000-0000-0000-000000000001' },
  { id:4,  name:'虎子', breed:'狸花猫',   city:'北京', health_status:'健康',   age:'1', is_neutered:false, gender:'male',   personality:'调皮捣蛋、爱跑酷', description:'灰黑色条纹，白手套',         photo_url:'', adoption_status:'seeking', created_by:'user_other' },
  { id:5,  name:'奶茶', breed:'三花猫',   city:'广州', health_status:'健康',   age:'2', is_neutered:true,  gender:'female', personality:'安静、有点胆小',   description:'白底橘黑斑块，粉色鼻头',     photo_url:'', adoption_status:'seeking', created_by:'user_other' },
  { id:6,  name:'团子', breed:'英短',     city:'深圳', health_status:'需要绝育', age:'1', is_neutered:false, gender:'male', personality:'憨厚粘人',        description:'蓝灰色短毛，圆脸铜色眼睛',   photo_url:'', adoption_status:'seeking', created_by:'user_other' },
];
```

- [ ] **Step 2: Commit**

```bash
git add data/mock.js
git commit -m "feat: add gender field to seed cat data"
```

---

### Task 3: 猫咪档案页 → 双列瀑布流

**Files:**
- Modify: `pages/index/index.wxml`
- Modify: `pages/index/index.wxss`
- Modify: `pages/index/index.js`

- [ ] **Step 1: 更新 index.js — 分裂数据 + 引入常量**

```js
// 猫咪档案 Tab1 — 浏览所有人的猫咪（只读）
const { select } = require('../../utils/supabase');
const { getAllCats } = require('../../data/mock');
const { STATUS_COLORS } = require('../../utils/constants');

Page({
  data: {
    leftCats: [],
    rightCats: [],
    loading: true,
    statusColors: STATUS_COLORS,
  },

  onShow() { this.loadCats(); },
  onPullDownRefresh() { this.loadCats().then(() => wx.stopPullDownRefresh()); },

  async loadCats() {
    this.setData({ loading: true });
    try {
      let cats;
      if (getApp().globalData.DEV_MODE) {
        await new Promise(r => setTimeout(r, 400));
        cats = getAllCats();
      } else {
        cats = await select('cats', { order: { column: 'created_at', direction: 'desc' } });
        cats = cats || [];
      }
      // 瀑布流分列：奇数索引左列，偶数索引右列
      const leftCats = cats.filter((_, i) => i % 2 === 0);
      const rightCats = cats.filter((_, i) => i % 2 === 1);
      this.setData({ leftCats, rightCats, loading: false });
    } catch (err) {
      console.error(err);
      this.setData({ loading: false });
    }
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/cat-detail/cat-detail?id=${id}` });
  },
});
```

- [ ] **Step 2: 更新 index.wxml — 双列瀑布流布局**

```html
<!-- 猫咪档案 Tab1 — 浏览所有猫咪（只读） -->
<view class="container">
  <view class="top-bar">
    <text class="title">全部猫咪 ({{leftCats.length + rightCats.length}})</text>
  </view>

  <!-- 加载骨架屏（双列） -->
  <view wx:if="{{loading}}" class="waterfall">
    <view class="col">
      <view class="skeleton card waterfall-card" wx:for="{{[1,3,5]}}" wx:key="*this"></view>
    </view>
    <view class="col">
      <view class="skeleton card waterfall-card" wx:for="{{[2,4]}}" wx:key="*this"></view>
    </view>
  </view>

  <!-- 空状态 -->
  <view wx:elif="{{leftCats.length === 0 && rightCats.length === 0}}" class="empty-state">
    <text style="font-size:80rpx;">🐱</text>
    <text>还没有猫咪档案</text>
  </view>

  <!-- 瀑布流双列 -->
  <view wx:else class="waterfall">
    <view class="col">
      <view class="archive-card card" wx:for="{{leftCats}}" wx:key="id" bindtap="goDetail" data-id="{{item.id}}">
        <image wx:if="{{item.photo_url}}" class="card-photo" src="{{item.photo_url}}" mode="aspectFill" />
        <view wx:else class="card-photo-placeholder">🐱</view>
        <view class="card-body">
          <view class="card-row">
            <view class="card-title-group">
              <text class="card-name">{{item.name}}</text>
              <text class="card-breed">{{item.breed || '未知'}}</text>
            </view>
            <text class="card-status-tag" style="color:{{statusColors[item.health_status]}}">{{item.health_status || '未知'}}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="col">
      <view class="archive-card card" wx:for="{{rightCats}}" wx:key="id" bindtap="goDetail" data-id="{{item.id}}">
        <image wx:if="{{item.photo_url}}" class="card-photo" src="{{item.photo_url}}" mode="aspectFill" />
        <view wx:else class="card-photo-placeholder">🐱</view>
        <view class="card-body">
          <view class="card-row">
            <view class="card-title-group">
              <text class="card-name">{{item.name}}</text>
              <text class="card-breed">{{item.breed || '未知'}}</text>
            </view>
            <text class="card-status-tag" style="color:{{statusColors[item.health_status]}}">{{item.health_status || '未知'}}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 3: 更新 index.wxss — 瀑布流 + 竖卡样式**

```css
/* ── 瀑布流容器 ── */
.waterfall {
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
}
.col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* ── 顶部栏 ── */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.title { font-size: 34rpx; font-weight: 700; }

/* ── 竖卡共用 ── */
.archive-card {
  padding: 0;
  overflow: hidden;
}
.waterfall-card {
  min-height: 240rpx;
}

/* ── 照片区 ── */
.card-photo {
  width: 100%;
  display: block;
}
.card-photo-placeholder {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72rpx;
  background: #FFF5EC;
}

/* ── 信息区 ── */
.card-body {
  padding: 16rpx 20rpx;
}
.card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}
.card-title-group {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.card-name {
  font-size: 28rpx;
  font-weight: 700;
  flex-shrink: 0;
}
.card-breed {
  font-size: 22rpx;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-status-tag {
  font-size: 22rpx;
  font-weight: 600;
  flex-shrink: 0;
}
```

- [ ] **Step 4: Commit**

```bash
git add pages/index/index.wxml pages/index/index.wxss pages/index/index.js
git commit -m "feat: convert cat archive to waterfall layout"
```

---

### Task 4: 猫咪领养页 → 双列瀑布流

**Files:**
- Modify: `pages/adoption-list/adoption-list.wxml`
- Modify: `pages/adoption-list/adoption-list.wxss`
- Modify: `pages/adoption-list/adoption-list.js`

- [ ] **Step 1: 更新 adoption-list.js — 分裂数据 + gender 展示**

```js
// 猫咪领养列表 Tab2
const { select } = require('../../utils/supabase');
const { getSeekingCats } = require('../../data/mock');
const { STATUS_COLORS, GENDER_LABELS, GENDER_COLORS } = require('../../utils/constants');

Page({
  data: {
    leftCats: [],
    rightCats: [],
    loading: true,
    cityFilter: '',
    cities: [],
    statusColors: STATUS_COLORS,
    genderLabels: GENDER_LABELS,
    genderColors: GENDER_COLORS,
  },

  onShow() { this.loadAdoptionCats(); },

  onPullDownRefresh() {
    this.loadAdoptionCats().then(() => wx.stopPullDownRefresh());
  },

  async loadAdoptionCats() {
    this.setData({ loading: true });
    try {
      let cats;
      if (getApp().globalData.DEV_MODE) {
        await new Promise(r => setTimeout(r, 300));
        cats = getSeekingCats();
      } else {
        cats = await select('cats', {
          filters: { adoption_status: 'seeking' },
          order: { column: 'created_at', direction: 'desc' },
        });
      }
      cats = cats || [];
      // 城市筛选
      const filteredCats = this.data.cityFilter
        ? cats.filter(c => c.city && c.city.includes(this.data.cityFilter))
        : cats;
      // 瀑布流分列
      const leftCats = filteredCats.filter((_, i) => i % 2 === 0);
      const rightCats = filteredCats.filter((_, i) => i % 2 === 1);
      const cities = [...new Set(cats.map(c => c.city).filter(Boolean))];
      this.setData({ leftCats, rightCats, cities, loading: false });
    } catch (err) {
      console.error('加载领养列表失败:', err);
      this.setData({ loading: false });
    }
  },

  onCityChange(e) {
    const idx = e.detail.value;
    const cityFilter = this.data.cities[idx] || '';
    this.setData({ cityFilter });
    // 重新加载以应用筛选
    this.loadAdoptionCats();
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/adoption-detail/adoption-detail?id=${id}` });
  },

  goBlacklist() {
    wx.navigateTo({ url: '/pages/blacklist/blacklist' });
  },
});
```

- [ ] **Step 2: 更新 adoption-list.wxml — 双列瀑布流**

```html
<!-- 猫咪领养列表 Tab2 -->
<view class="container">
  <!-- 顶部操作栏 -->
  <view class="top-bar">
    <picker mode="selector" range="{{cities}}" bindchange="onCityChange">
      <view class="filter-item">{{cityFilter || '全部城市'}} ▾</view>
    </picker>
    <view class="blacklist-entry" bindtap="goBlacklist">
      <text style="font-size:28rpx;">⚠️</text>
      <text style="font-size:24rpx;color:var(--danger);">黑名单</text>
    </view>
  </view>

  <!-- 加载骨架屏（双列） -->
  <view wx:if="{{loading}}" class="waterfall">
    <view class="col">
      <view class="skeleton card waterfall-card" wx:for="{{[1,3,5]}}" wx:key="*this"></view>
    </view>
    <view class="col">
      <view class="skeleton card waterfall-card" wx:for="{{[2,4]}}" wx:key="*this"></view>
    </view>
  </view>

  <!-- 空状态 -->
  <view wx:elif="{{leftCats.length === 0 && rightCats.length === 0}}" class="empty-state">
    <text style="font-size:80rpx;margin-bottom:20rpx;">🏠</text>
    <text>暂无可领养的猫咪</text>
  </view>

  <!-- 瀑布流双列 -->
  <view wx:else class="waterfall">
    <view class="col">
      <view class="adopt-card card" wx:for="{{leftCats}}" wx:key="id" bindtap="goDetail" data-id="{{item.id}}">
        <image wx:if="{{item.photo_url}}" class="card-photo" src="{{item.photo_url}}" mode="aspectFill" />
        <view wx:else class="card-photo-placeholder">🐱</view>
        <view class="card-body">
          <view class="card-row">
            <text class="card-name">{{item.name}}</text>
            <text class="card-status-tag" style="color:{{statusColors[item.health_status]}}">{{item.health_status || '未知'}}</text>
          </view>
          <view class="card-meta-row">
            <text wx:if="{{item.city}}" class="meta-item">📍{{item.city}}</text>
            <text wx:if="{{item.age}}" class="meta-sep">·</text>
            <text wx:if="{{item.age}}" class="meta-item">{{item.age}}岁</text>
            <text wx:if="{{item.gender}}" class="meta-sep">·</text>
            <text wx:if="{{item.gender}}" class="meta-item" style="color:{{genderColors[item.gender] || '#666'}}">{{genderLabels[item.gender] || '❓未知'}}</text>
            <text class="meta-sep">·</text>
            <text class="meta-item">{{item.is_neutered ? '已绝育' : '未绝育'}}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="col">
      <view class="adopt-card card" wx:for="{{rightCats}}" wx:key="id" bindtap="goDetail" data-id="{{item.id}}">
        <image wx:if="{{item.photo_url}}" class="card-photo" src="{{item.photo_url}}" mode="aspectFill" />
        <view wx:else class="card-photo-placeholder">🐱</view>
        <view class="card-body">
          <view class="card-row">
            <text class="card-name">{{item.name}}</text>
            <text class="card-status-tag" style="color:{{statusColors[item.health_status]}}">{{item.health_status || '未知'}}</text>
          </view>
          <view class="card-meta-row">
            <text wx:if="{{item.city}}" class="meta-item">📍{{item.city}}</text>
            <text wx:if="{{item.age}}" class="meta-sep">·</text>
            <text wx:if="{{item.age}}" class="meta-item">{{item.age}}岁</text>
            <text wx:if="{{item.gender}}" class="meta-sep">·</text>
            <text wx:if="{{item.gender}}" class="meta-item" style="color:{{genderColors[item.gender] || '#666'}}">{{genderLabels[item.gender] || '❓未知'}}</text>
            <text class="meta-sep">·</text>
            <text class="meta-item">{{item.is_neutered ? '已绝育' : '未绝育'}}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 3: 更新 adoption-list.wxss — 瀑布流 + 竖卡样式**

```css
/* ── 顶部栏 ── */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.filter-item {
  background: var(--card); padding: 14rpx 24rpx;
  border-radius: 40rpx; font-size: 26rpx; color: var(--text-secondary);
}
.blacklist-entry {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: var(--card);
  padding: 14rpx 24rpx;
  border-radius: 40rpx;
  border: 2rpx solid #FFCDD2;
}

/* ── 瀑布流容器 ── */
.waterfall {
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
}
.col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* ── 竖卡共用 ── */
.adopt-card {
  padding: 0;
  overflow: hidden;
}
.waterfall-card {
  min-height: 240rpx;
}

/* ── 照片区 ── */
.card-photo {
  width: 100%;
  display: block;
}
.card-photo-placeholder {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72rpx;
  background: #FFF5EC;
}

/* ── 信息区 ── */
.card-body {
  padding: 16rpx 20rpx;
}
.card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}
.card-name {
  font-size: 28rpx;
  font-weight: 700;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-status-tag {
  font-size: 22rpx;
  font-weight: 600;
  flex-shrink: 0;
}

/* ── 第二行：城市/年龄/性别/绝育 ── */
.card-meta-row {
  display: flex;
  align-items: center;
  gap: 2rpx;
  margin-top: 8rpx;
  flex-wrap: wrap;
}
.meta-item {
  font-size: 20rpx;
  color: var(--text-secondary);
}
.meta-sep {
  font-size: 20rpx;
  color: #CCC;
  margin: 0 2rpx;
}
```

- [ ] **Step 4: Commit**

```bash
git add pages/adoption-list/adoption-list.wxml pages/adoption-list/adoption-list.wxss pages/adoption-list/adoption-list.js
git commit -m "feat: convert adoption list to waterfall layout with gender display"
```

---

### Task 5: 猫咪详情页展示性别

**Files:**
- Modify: `pages/cat-detail/cat-detail.wxml`
- Modify: `pages/cat-detail/cat-detail.js`（如需引入常量）

- [ ] **Step 1: 更新 cat-detail.js 引入 gender 常量**

```js
// 在文件顶部 require 区添加
const { STATUS_COLORS, GENDER_LABELS } = require('../../utils/constants');
```

在 `data` 中添加：
```js
data: { cat: null, loading: true, statusColors: STATUS_COLORS, genderLabels: GENDER_LABELS },
```

- [ ] **Step 2: 更新 cat-detail.wxml — 在 info-grid 中添加性别行**

在绝育行 `<view class="info-item">...</view>` 之前插入：

```html
<view class="info-item"><text class="info-label">性别</text><text>{{genderLabels[cat.gender] || '未知'}}</text></view>
```

完整 `info-grid` 变为：

```html
<view class="info-grid">
  <view class="info-item"><text class="info-label">状态</text><text style="color:{{statusColors[cat.health_status]}}">{{cat.health_status}}</text></view>
  <view class="info-item"><text class="info-label">城市</text><text>{{cat.city || '未知'}}</text></view>
  <view class="info-item"><text class="info-label">年龄</text><text>{{cat.age || '未知'}}</text></view>
  <view class="info-item"><text class="info-label">性别</text><text>{{genderLabels[cat.gender] || '未知'}}</text></view>
  <view class="info-item"><text class="info-label">绝育</text><text>{{cat.is_neutered ? '是' : '否'}}</text></view>
</view>
```

- [ ] **Step 3: Commit**

```bash
git add pages/cat-detail/cat-detail.wxml pages/cat-detail/cat-detail.js
git commit -m "feat: add gender display to cat detail page"
```

---

### Task 6: 猫咪表单页新增性别选择器

**Files:**
- Modify: `pages/cat-form/cat-form.wxml`
- Modify: `pages/cat-form/cat-form.js`

- [ ] **Step 1: 更新 cat-form.js — 添加 gender 字段**

在 require 区添加引入：
```js
const { BREEDS, CAT_STATUS, STATUS_COLORS, GENDER_OPTIONS, GENDER_VALUES } = require('../../utils/constants');
```

在 `data.form` 中添加 `gender: null`：
```js
form: {
  name: '', breed: '', region: ['', '', ''], status: '健康',
  age: '', is_neutered: false, gender: null,
  personality: '', appearance: '',
  adoption_status: 'none',
},
```

在 `data` 中添加 gender 选项：
```js
genderOptions: GENDER_OPTIONS,
genderValues: GENDER_VALUES,
```

在 `loadCat` 中，`form` 对象添加 `gender: c.gender || null`。

在 `onSelect` 中添加 gender 处理分支：
```js
else if (field === 'gender') this.setData({
  'form.gender': this.data.genderValues[idx],
});
```

在 `onSubmit` 的 DEV_MODE payload 中添加：
```js
gender: f.gender,
```

在真实 API payload 中也添加：
```js
gender: f.gender,
```

- [ ] **Step 2: 更新 cat-form.wxml — 添加性别选择器**

在「年龄」和「是否已绝育」之间插入：

```html
<view class="form-group">
  <text class="label">性别</text>
  <picker mode="selector" range="{{genderOptions}}" bindchange="onSelect" data-field="gender">
    <view class="picker-value">
      {{genderOptions[genderValues.indexOf(form.gender)] || '请选择性别'}}
    </view>
  </picker>
</view>
```

- [ ] **Step 3: Commit**

```bash
git add pages/cat-form/cat-form.wxml pages/cat-form/cat-form.js
git commit -m "feat: add gender selector to cat form"
```

---

### Task 7: 验证与收尾

**Files:** 无新建

- [ ] **Step 1: 在微信开发者工具中打开项目，确认 DEV_MODE=true**

- [ ] **Step 2: 验证猫咪档案页（Tab1）**
  - 页面显示双列瀑布流
  - 6 只猫咪正确分列（左列 1/3/5，右列 2/4/6）
  - 卡片竖排：照片→名字+品种(左) 健康状态(右)
  - 点击卡片跳转详情页正常

- [ ] **Step 3: 验证猫咪领养页（Tab2）**
  - 仅显示 adoption_status=seeking 的猫（小花/虎子/奶茶/团子）
  - 城市筛选正常
  - 卡片第二行显示：城市 · 年龄 · ♂/♀男孩/女孩 · 绝育
  - 性别颜色正确：♂蓝色 #1976D2，♀粉色 #E91E63

- [ ] **Step 4: 验证猫咪详情页**
  - info-grid 中展示性别行
  - 小花/雪球/奶茶显示「♀女孩」
  - 小黑/虎子/团子显示「♂男孩」

- [ ] **Step 5: 验证猫咪表单页**
  - 新建/编辑猫咪时可选择性别（未知/男孩/女孩）
  - 提交后性别正确保存

- [ ] **Step 6: 下拉刷新**
  - 两个瀑布流页面下拉刷新后布局保持正确

- [ ] **Step 7: Commit（如有修正）**

```bash
git add -A
git commit -m "chore: final verification tweaks"
```
