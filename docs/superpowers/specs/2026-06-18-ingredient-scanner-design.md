# 拍照识配料 — 功能设计

**日期**: 2026-06-18  
**状态**: 已确认

---

## 目标

用户拍摄产品包装上的配料表，OCR 识别出每样配料，逐一标注对猫咪的安全性（安全/慎用/危险/未知），帮助养猫人快速判断食品是否适合猫咪食用。

## 入口

- **位置**: 食物查询页（`pages/food-search`）顶部，搜索栏上方
- **UI**: 卡片区域，📷 图标 + 「拍照识别配料表」引导文案
- **不新增 Tab**，不改变现有 4 Tab 结构

## 用户流程

```
食物查询 → 点 📷 入口
  → 全屏拍照（相机取景框 + 引导文案"请拍摄产品配料表"）
  → 预览确认页
      - 照片清晰 → 点击「确认识别」
      - 照片模糊 → 点击「重拍」
  → 分析结果页
      - 每样配料一行：图标 + 名称 + 说明 + 安全等级标签
      - 四级标签：✅ 安全（绿）/ ⚠️ 慎用（橙）/ 🔴 危险（红）/ ❓ 未知（灰）
  → 可点击「再拍一张」回到拍照
```

## 不做

- ❌ 不保存扫描历史记录
- ❌ 不提供手动裁剪功能（OCR 自动识别文字区域）
- ❌ 不新增独立 Tab

## 技术方案

| 环节 | 方案 | 说明 |
|------|------|------|
| 拍照 | `wx.chooseImage({ sourceType: ['camera'] })` | 直接调起相机 |
| OCR 识别 | 云函数 `ocr-ingredients` 调腾讯云 OCR | 云环境 `cloudbase-d2g4q6xck93c02591` 已有，开通 OCR 能力即可 |
| 配料匹配 | 扩展 `data/foods.js` 数据库 | 每样配料 name → safety_level + description |
| 未匹配项 | 标记「未知」+ 灰色提示「暂未收录」 | 不猜测，不误导 |

## 新增/修改文件

| 文件 | 类型 | 说明 |
|------|------|------|
| `pages/food-search/food-search.wxml` | 修改 | 搜索栏上方加相机入口卡片 |
| `pages/food-search/food-search.wxss` | 修改 | 入口卡片样式 |
| `pages/food-search/food-search.js` | 修改 | 添加入口跳转逻辑 |
| `pages/ingredient-scan/ingredient-scan.*` | 新增 | 拍照 + 确认预览页 |
| `pages/ingredient-result/ingredient-result.*` | 新增 | 分析结果页 |
| `data/foods.js` | 修改 | 扩展数据库字段，增加配料别名 |
| `cloudfunctions/ocr-ingredients/` | 新增 | OCR 云函数 |
| `app.json` | 修改 | 注册 2 个新页面 |

## 隐私相关

需要检查 `wx.chooseImage({ sourceType: ['camera'] })` 是否已在隐私指引中声明。

当前隐私指引已声明「收集你选中的照片或视频信息，用于猫咪照片上传至档案、领养协议扫描件回传、黑名单举报证据采集」——此项已覆盖拍照场景，但用途说明未提及「配料表识别」。下次提交审核时可在该项目的用途中补充。

## OCR 云函数设计

```js
// cloudfunctions/ocr-ingredients/index.js
// 1. 接收 base64 图片
// 2. 调用腾讯云 OCR 通用文字识别
// 3. 提取文字中匹配「配料」模式的内容（配料表、原料、成分等关键词后）
// 4. 返回配料名称列表
```

## 结果匹配逻辑

```
OCR 配料名称 → 去 foods 数据库匹配
  - 精确匹配 name → 返回 safety + description
  - 模糊匹配别名 (aliases) → 返回 safety + description
  - 都不匹配 → 返回 { safety: 'unknown', description: '暂未收录' }
```

---

*设计确认于 2026-06-18，福福 + Claude Code*
