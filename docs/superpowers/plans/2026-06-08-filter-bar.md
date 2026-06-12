# 猫咪广场筛选栏 — 实现计划

**Goal:** 在 index 页瀑布流上方新增城市/品种/搜索三条件联动筛选栏

**Files:** 仅 `pages/index/index.*` 三个文件

---

### Task 1: 更新 index.js — 筛选逻辑

- 引入 BREEDS 常量
- data 新增: cityFilter, breedFilter, searchKeyword, cities 数组
- loadCats 后提取城市列表
- 新增 applyFilters() 方法：三条件取交集
- 新增 onCityChange / onBreedChange / onSearchInput（300ms 防抖）
- 新增 clearFilter() 方法

### Task 2: 更新 index.wxml — 筛选栏 UI

- 标题下方新增三列筛选栏
- 激活标签行（有条件时显示）
- 结果计数同步更新

### Task 3: 更新 index.wxss — 筛选栏样式

- filter-bar 三列 flex
- filter-pill 按钮样式
- 激活标签样式
- 搜索框样式
