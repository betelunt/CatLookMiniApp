// 配料分析结果页
const foodsData = require('../../data/foods');

Page({
  data: {
    ingredients: [],
    stats: { safe: 0, caution: 0, danger: 0, unknown: 0 },
  },

  onLoad(options) {
    if (!options.data) {
      wx.showToast({ title: '无识别数据', icon: 'none' });
      return;
    }
    const rawIngredients = JSON.parse(decodeURIComponent(options.data));
    const ingredients = this.matchIngredients(rawIngredients);
    const stats = this.calcStats(ingredients);
    this.setData({ ingredients, stats });
  },

  /** 匹配数据库 */
  matchIngredients(names) {
    return names.map(name => {
      const n = name.trim();
      if (!n) return null;

      // 精确匹配 name
      let match = foodsData.find(f => f.name === n);
      // 模糊匹配（包含关系）
      if (!match) {
        match = foodsData.find(f =>
          f.name.includes(n) || n.includes(f.name)
        );
      }

      if (match) {
        return {
          name: match.name,
          safety: match.safety,
          description: match.effect || match.advice || match.nutrition || '',
          warning: match.warning || '',
        };
      }

      // 未匹配 → 标记未知
      return {
        name: n,
        safety: 'unknown',
        description: '暂未收录此配料信息',
        warning: '',
      };
    }).filter(Boolean);
  },

  /** 统计 */
  calcStats(ingredients) {
    const stats = { safe: 0, caution: 0, danger: 0, unknown: 0 };
    ingredients.forEach(i => {
      if (stats[i.safety] !== undefined) stats[i.safety]++;
    });
    return stats;
  },

  /** 再拍一张 */
  scanAgain() {
    wx.redirectTo({ url: '/pages/ingredient-scan/ingredient-scan' });
  },
});
