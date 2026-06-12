// 猫咪广场 Tab1 — 浏览所有人的猫咪（只读）
const { select } = require('../../utils/supabase');
const { getAllCats } = require('../../data/mock');
const { STATUS_COLORS, BREEDS } = require('../../utils/constants');

Page({
  data: {
    leftCats: [],
    rightCats: [],
    loading: true,
    statusColors: STATUS_COLORS,

    // 筛选
    cityFilter: '',
    breedFilter: '',
    searchKeyword: '',
    cities: [],
    breedOptions: ['全部', ...BREEDS],
  },

  // 缓存全部猫咪用于前端过滤
  _allCats: [],
  _searchTimer: null,

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
      this._allCats = cats;
      // 提取城市列表（"全部" 作为默认选项）
      const rawCities = [...new Set(cats.map(c => c.city).filter(Boolean))];
      this.setData({ cities: ['全部', ...rawCities] });
      this.applyFilters();
    } catch (err) {
      console.error(err);
      this.setData({ loading: false });
    }
  },

  /** 三条件联动过滤 + 瀑布流分列 */
  applyFilters() {
    let cats = this._allCats;
    const { cityFilter, breedFilter, searchKeyword } = this.data;

    if (cityFilter) {
      cats = cats.filter(c => c.city && c.city.includes(cityFilter));
    }
    if (breedFilter) {
      cats = cats.filter(c => c.breed === breedFilter);
    }
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      cats = cats.filter(c => c.name && c.name.toLowerCase().includes(kw));
    }

    const leftCats = cats.filter((_, i) => i % 2 === 0);
    const rightCats = cats.filter((_, i) => i % 2 === 1);
    this.setData({ leftCats, rightCats, loading: false });
  },

  /** 城市选择 */
  onCityChange(e) {
    const idx = e.detail.value;
    const cityFilter = idx > 0 ? this.data.cities[idx] : '';
    this.setData({ cityFilter });
    this.applyFilters();
  },

  /** 品种选择 */
  onBreedChange(e) {
    const idx = e.detail.value;
    const breedFilter = idx > 0 ? this.data.breedOptions[idx] : '';
    this.setData({ breedFilter });
    this.applyFilters();
  },

  /** 名字搜索（300ms 防抖） */
  onSearchInput(e) {
    const searchKeyword = e.detail.value;
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this.setData({ searchKeyword });
      this.applyFilters();
    }, 300);
  },

  /** 清除单个筛选 */
  clearFilter(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [key]: '' });
    this.applyFilters();
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/cat-detail/cat-detail?id=${id}` });
  },
});
