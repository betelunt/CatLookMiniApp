// 猫咪领养列表 Tab2
const { select, getThumbUrl } = require('../../utils/supabase');
const { getSeekingCats } = require('../../data/mock');
const { STATUS_COLORS, GENDER_LABELS, GENDER_COLORS, BREEDS } = require('../../utils/constants');
const { cacheSet, cacheGet } = require('../../utils/cache');
const { fillCities } = require('../../utils/geo');
const getThumb = (url, w) => getThumbUrl(url, w);

const CACHE_KEY = 'adoption_cats';
const CACHE_TTL = 30;
const PAGE_SIZE = 20;

Page({
  data: {
    leftCats: [],
    rightCats: [],
    loading: true,

    // 筛选
    cityFilter: '',
    breedFilter: '',
    searchKeyword: '',
    cities: [],
    breedOptions: ['全部', ...BREEDS],

    statusColors: STATUS_COLORS,
    genderLabels: GENDER_LABELS,
    genderColors: GENDER_COLORS,
  },

  _allCats: [],
  _searchTimer: null,

  onShow() { this.loadAdoptionCats(); },

  onPullDownRefresh() {
    this.loadAdoptionCats(true).then(() => wx.stopPullDownRefresh());
  },

  async loadAdoptionCats(forceRefresh = false) {
    this.setData({ loading: true });
    try {
      let cats;
      if (getApp().globalData.DEV_MODE) {
        await new Promise(r => setTimeout(r, 300));
        cats = getSeekingCats();
      } else {
        if (!forceRefresh) {
          const cached = cacheGet(CACHE_KEY);
          if (cached) { cats = cached; }
        }
        if (!cats) {
          cats = await select('cats', {
            columns: 'id,name,breed,city,latitude,longitude,photo_url,archive_code,health_status,gender,adoption_status',
            filters: { adoption_status: 'seeking', life_status: 'active' },
            order: { column: 'created_at', direction: 'desc' },
            limit: PAGE_SIZE,
            publicRead: true,
          });
          cats = cats || [];
          cats = await fillCities(cats);
          cacheSet(CACHE_KEY, cats, CACHE_TTL);
        }
      }
      this._allCats = cats;
      const rawCities = [...new Set(cats.map(c => c.city).filter(Boolean))];
      this.setData({ cities: ['全部', ...rawCities] });
      this.applyFilters();
    } catch (err) {
      console.error('加载领养列表失败:', err);
      this.setData({ loading: false });
    }
  },

  /** 三条件联动过滤 + 瀑布流分列 */
  applyFilters() {
    let cats = (this._allCats || []).map(cat => ({
      ...cat,
      photo_url: getThumb(cat.photo_url, 200),
    }));
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
    wx.navigateTo({ url: `/pages/adoption-detail/adoption-detail?id=${id}` });
  },

  goBlacklist() {
    wx.navigateTo({ url: '/pages/blacklist/blacklist' });
  },
});
