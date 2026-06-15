// 猫咪广场 Tab1 — 浏览所有人的猫咪（只读）
const { select, getThumbUrl } = require('../../utils/supabase');
const { getAllCats } = require('../../data/mock');
const { STATUS_COLORS, BREEDS } = require('../../utils/constants');
const { cacheSet, cacheGet } = require('../../utils/cache');
const { fillCities } = require('../../utils/geo');
const getThumb = (url, w) => getThumbUrl(url, w);

const CACHE_KEY = 'index_cats';
const CACHE_TTL = 30;
const PAGE_SIZE = 100;  // 足够覆盖当前全部猫咪，后续超百只时触底自动加载更多

Page({
  data: {
    leftCats: [],
    rightCats: [],
    totalCount: 0,        // 数据库真实总数
    loading: true,
    loadingMore: false,
    hasMore: true,
    statusColors: STATUS_COLORS,

    // 筛选
    cityFilter: '',
    breedFilter: '',
    searchKeyword: '',
    cities: [],
    breedOptions: ['全部', ...BREEDS],
  },

  _allCats: [],         // 全量缓存（前端过滤用）
  _searchTimer: null,
  _touchStartY: 0,      // 防误触：记录触摸起始位置
  _touchMoved: false,   // 防误触：是否发生了滑动

  onShow() { this.loadCats(); },
  onPullDownRefresh() { this.loadCats(true).then(() => wx.stopPullDownRefresh()); },

  // ── 触底加载更多 ──
  onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.loadMore();
  },

  // ── 触摸跟踪（防误触） ──
  onCardTouchStart(e) {
    this._touchStartY = e.touches[0].clientY;
    this._touchMoved = false;
  },
  onCardTouchMove() {
    this._touchMoved = true;
  },
  onCardTap(e) {
    // 滑动超过 10px 视为滚动，不触发点击
    if (this._touchMoved) return;
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/cat-detail/cat-detail?id=${id}` });
  },

  async loadCats(forceRefresh = false) {
    this.setData({ loading: true, hasMore: true });
    try {
      let cats;
      if (getApp().globalData.DEV_MODE) {
        await new Promise(r => setTimeout(r, 400));
        cats = getAllCats();
      } else {
        if (!forceRefresh) {
          const cached = cacheGet(CACHE_KEY);
          if (cached) cats = cached;
        }
        if (!cats) {
          // 并行：数据 + 总数，减少请求等待
          const [catList, countResult] = await Promise.all([
            select('cats', {
              columns: 'id,name,breed,city,latitude,longitude,photo_url,archive_code,health_status,gender,created_at',
              filters: { life_status: 'active' },
              order: { column: 'created_at', direction: 'desc' },
              limit: PAGE_SIZE,
              publicRead: true,
            }),
            select('cats', {
              columns: 'id',
              filters: { life_status: 'active' },
              limit: 1,
              publicRead: true,
              count: 'exact',
            }),
          ]);
          cats = catList || [];
          const totalCount = countResult?.totalCount || cats.length;
          this.setData({ totalCount });
          cacheSet(CACHE_KEY, cats, CACHE_TTL);
        }
      }
      this._allCats = await fillCities(cats);
      this.setData({ hasMore: cats.length >= PAGE_SIZE });
      const rawCities = [...new Set(this._allCats.map(c => c.city).filter(Boolean))];
      this.setData({ cities: ['全部', ...rawCities] });
      this.applyFilters();
    } catch (err) {
      console.error(err);
      this.setData({ loading: false });
    }
  },

  /** 加载更多 */
  async loadMore() {
    if (getApp().globalData.DEV_MODE) return;
    this.setData({ loadingMore: true });
    try {
      const offset = this._allCats.length;
      const more = await select('cats', {
        columns: 'id,name,breed,city,latitude,longitude,photo_url,archive_code,health_status,gender,created_at',
        filters: { life_status: 'active' },
        order: { column: 'created_at', direction: 'desc' },
        limit: PAGE_SIZE,
        offset,
        publicRead: true,
      });
      if (!more || more.length === 0) {
        this.setData({ hasMore: false, loadingMore: false });
        return;
      }
      const filled = await fillCities(more);
      this._allCats = [...this._allCats, ...filled];
      cacheSet(CACHE_KEY, this._allCats, CACHE_TTL);
      this.setData({ hasMore: more.length >= PAGE_SIZE, loadingMore: false });
      this.applyFilters();
    } catch (err) {
      console.error(err);
      this.setData({ loadingMore: false });
    }
  },

  /** 过滤 + 去重 + 统一尺寸 + 瀑布流分列 */
  applyFilters() {
    const { cityFilter, breedFilter, searchKeyword } = this.data;

    // 1. 筛选
    let cats = this._allCats || [];
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

    // 2. 照片去重（同一张照片用于多只猫时，只展示一次）
    const seen = new Set();
    cats = cats.filter(c => {
      if (!c.photo_url) return true;  // 没照片的保留
      if (seen.has(c.photo_url)) return false;
      seen.add(c.photo_url);
      return true;
    });

    // 3. 缩略图 + 固定高度（w:200 h:280 → 5:7 比例，统一对齐）
    cats = cats.map(cat => ({
      ...cat,
      photo_url: getThumb(cat.photo_url, 200),
    }));

    // 4. 瀑布流分列
    const leftCats = cats.filter((_, i) => i % 2 === 0);
    const rightCats = cats.filter((_, i) => i % 2 === 1);
    this.setData({ leftCats, rightCats, loading: false });
  },

  // ── 筛选操作 ──
  onCityChange(e) {
    const idx = e.detail.value;
    const cityFilter = idx > 0 ? this.data.cities[idx] : '';
    this.setData({ cityFilter });
    this.applyFilters();
  },
  onBreedChange(e) {
    const idx = e.detail.value;
    const breedFilter = idx > 0 ? this.data.breedOptions[idx] : '';
    this.setData({ breedFilter });
    this.applyFilters();
  },
  onSearchInput(e) {
    const searchKeyword = e.detail.value;
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this.setData({ searchKeyword });
      this.applyFilters();
    }, 300);
  },
  clearFilter(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [key]: '' });
    this.applyFilters();
  },
});
