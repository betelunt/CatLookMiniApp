# 瀑布流布局改造 + 性别字段 — 设计文档

> 日期：2026-06-08
> 状态：设计完成，待实现

## 概述

将「猫咪档案」(`pages/index`) 和「猫咪领养」(`pages/adoption-list`) 两个 Tab 页面从当前的**单列横卡列表**改为**双列瀑布流竖卡**，与 Flutter App 照片广场风格统一。同时新增 `gender` 字段到数据模型。

## 卡片设计

### 共用结构

```
┌──────────────────────┐
│                      │
│    猫咪照片           │  ← mode="aspectFill"，自然比例形成高度差
│                      │
├──────────────────────┤
│ 名字         健康标签 │  ← justify-content: space-between
│ [第二行信息·可选]    │  ← 仅领养页展示
└──────────────────────┘
```

### 猫咪档案卡

| 行 | 左 | 右 |
|-----|-----|-----|
| 1 | **名字** · 品种 | 健康状态标签 |

健康标签靠右 (`justify-content: space-between`)。

### 猫咪领养卡

| 行 | 左 | 右 |
|-----|-----|-----|
| 1 | **名字** | 健康状态标签 |
| 2 | 📍城市 · 年龄 · ♂/♀性别 · 绝育状态 | — |

性别颜色：♂男孩 `#1976D2` 蓝，♀女孩 `#E91E63` 粉，未知 `#666` 深灰。

## 技术方案

### 瀑布流实现：JS 双数组分列

微信小程序对 CSS `column-count` 支持不稳定，采用 JS 分裂 + Flex 布局：

```js
// JS 层
const leftCats = cats.filter((_, i) => i % 2 === 0);
const rightCats = cats.filter((_, i) => i % 2 === 1);
```

```html
<!-- WXML 层 -->
<view class="waterfall">
  <view class="col">
    <view wx:for="{{leftCats}}" wx:key="id">...</view>
  </view>
  <view class="col">
    <view wx:for="{{rightCats}}" wx:key="id">...</view>
  </view>
</view>
```

```css
/* WXSS 层 */
.waterfall { display: flex; gap: 16rpx; align-items: flex-start; }
.col { flex: 1; display: flex; flex-direction: column; gap: 16rpx; }
```

### 照片处理

- 使用 `<image mode="aspectFill" />` 保证照片填满卡片宽度
- 设置固定宽度（100%），高度自适应（`mode="widthFix"` 备选）
- 初始用 `aspect-ratio` 固定比例，加载真实图片后自然撑高
- 无照片时显示占位符 🐱

## 新增 gender 字段

### 数据库

```sql
ALTER TABLE cats ADD COLUMN gender TEXT;  -- 'male' | 'female' | NULL
```

### Mock 数据

每只种子猫新增 `gender` 字段：`'male'` / `'female'`

### 展示

- 领养卡片第二行：`♂男孩`（蓝色）或 `♀女孩`（蓝色）
- 详情页 (`cat-detail`)：元数据行新增性别
- 表单页 (`cat-form`)：新增性别选择器（男孩 / 女孩 / 未知）

## 涉及文件

| 文件 | 改动 |
|------|------|
| `pages/index/index.wxml` | 单列 → 双列瀑布流 WXML |
| `pages/index/index.wxss` | 横卡 → 竖卡样式 |
| `pages/index/index.js` | 新增 `leftCats` / `rightCats` 分裂逻辑 |
| `pages/adoption-list/adoption-list.wxml` | 同上 |
| `pages/adoption-list/adoption-list.wxss` | 同上 |
| `pages/adoption-list/adoption-list.js` | 同上 |
| `data/mock.js` | 种子数据 + gender 字段 |
| `pages/cat-detail/cat-detail.wxml` | 详情页展示性别 |
| `pages/cat-form/cat-form.wxml` | 表单新增性别选择器 |
| `pages/cat-form/cat-form.js` | 表单数据绑定 + gender |
| `database/migration_gender.sql` | 新增 migration SQL |

## 实现要点

1. **骨架屏适配**：loading 态骨架屏也改为双列
2. **空状态**：保持居中显示，不受列布局影响
3. **下拉刷新**：保持现有 `onPullDownRefresh` 逻辑
4. **城市筛选**（领养页）：保留顶部 filter bar，不影响瀑布流
5. **DEV_MODE**：保持 mock 数据切换逻辑不变
6. **点击跳转**：`bindtap="goDetail"` 逻辑不变
