// 黑名单举报表单 - 3 步
const { BLACKLIST_CATEGORIES, submitReport } = require('../../data/blacklist');

Page({
  data: {
    step: 1,
    submitting: false,

    // Step 1 — 失信人信息
    role: 'adopter',
    gender: '',
    realName: '',
    idNumber: '',
    wechatNickname: '',
    phone: '',
    wechatId: '',
    city: '',
    address: '',

    // Step 2 — 举报理由
    categories: BLACKLIST_CATEGORIES.adopter,
    category: '',
    description: '',
    evidenceFiles: [],  // local temp paths for preview
    evidenceUrls: [],   // uploaded URLs

    // Step 3 — 举报人联系方式
    reporterName: '',
    reporterWx: '',
    reporterPhone: '',
  },

  onLoad() {
    // 如果已登录，预填
    const user = getApp().globalData.userInfo;
    if (user) {
      this.setData({
        reporterName: user.nickName || '',
      });
    }
  },

  /** Role 切换时更新分类列表 */
  onRoleChange(e) {
    const role = e.detail.value;
    this.setData({
      role,
      categories: BLACKLIST_CATEGORIES[role],
      category: '',  // 清空已选分类
    });
  },

  // ── 通用输入绑定 ──

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  onGenderSelect(e) {
    this.setData({ gender: e.currentTarget.dataset.gender });
  },

  onCityChange(e) {
    this.setData({ city: e.detail.value.join(' ') });
  },

  onCategorySelect(e) {
    this.setData({ category: e.currentTarget.dataset.cat });
  },

  // ── 图片上传 ──

  onChooseImage() {
    const remain = 9 - this.data.evidenceFiles.length;
    if (remain <= 0) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }
    wx.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const files = [...this.data.evidenceFiles, ...res.tempFilePaths];
        this.setData({ evidenceFiles: files });
      },
    });
  },

  onRemoveImage(e) {
    const idx = e.currentTarget.dataset.idx;
    const files = [...this.data.evidenceFiles];
    files.splice(idx, 1);
    this.setData({ evidenceFiles: files });
  },

  // ── 步骤导航 ──

  /** 下一步 */
  onNext() {
    const { step } = this.data;
    const err = this.validateStep(step);
    if (err) {
      wx.showToast({ title: err, icon: 'none' });
      return;
    }
    this.setData({ step: step + 1 });
    wx.pageScrollTo({ scrollTop: 0 });
  },

  /** 上一步 */
  onPrev() {
    if (this.data.step <= 1) return;
    this.setData({ step: this.data.step - 1 });
    wx.pageScrollTo({ scrollTop: 0 });
  },

  /** 提交 */
  async onSubmit() {
    const err = this.validateStep(3);
    if (err) {
      wx.showToast({ title: err, icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    try {
      // 上传图片到 Supabase Storage（DEV_MODE 下直接存本地路径）
      let evidenceUrls = [];
      if (this.data.evidenceFiles.length > 0) {
        if (getApp().globalData.DEV_MODE) {
          // DEV_MODE: 直接存本地路径（仅用于展示，真机上路径可能失效）
          evidenceUrls = [...this.data.evidenceFiles];
        } else {
          // 真实模式：逐张上传
          const { uploadFile } = require('../../utils/supabase');
          for (const file of this.data.evidenceFiles) {
            const filename = `blacklist/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
            const result = await uploadFile('evidence', filename, file);
            evidenceUrls.push(result.Key || result.key || filename);
          }
        }
      }

      const payload = {
        role: this.data.role,
        gender: this.data.gender,
        real_name: this.data.realName.trim() || null,
        id_number: this.data.idNumber.trim() || null,
        wechat_nickname: this.data.wechatNickname.trim() || null,
        phone: this.data.phone.trim() || null,
        wechat_id: this.data.wechatId.trim() || null,
        city: this.data.city,
        address: this.data.address.trim() || null,
        category: this.data.category,
        description: this.data.description.trim(),
        evidence_urls: evidenceUrls,
        reporter_name: this.data.reporterName.trim(),
        reporter_wx: this.data.reporterWx.trim(),
        reporter_phone: this.data.reporterPhone.trim(),
      };

      await submitReport(payload);

      wx.showToast({ title: '举报提交成功！', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('提交举报失败:', err);
      wx.showToast({ title: '提交失败，请重试', icon: 'none' });
    }

    this.setData({ submitting: false });
  },

  // ── 校验 ──

  validateStep(step) {
    const d = this.data;
    if (step === 1) {
      if (!d.gender) return '请选择性别';
      if (!d.phone.trim() && !d.wechatId.trim()) return '手机号和微信号至少填写一项';
      if (!d.city) return '请选择所在城市';
      return null;
    }
    if (step === 2) {
      if (!d.category) return '请选择举报分类';
      if (d.description.trim().length < 20) return '详细描述至少20个字';
      if (d.evidenceFiles.length === 0) return '请上传证据图片';
      return null;
    }
    if (step === 3) {
      if (!d.reporterName.trim()) return '请填写您的姓名';
      if (!d.reporterWx.trim()) return '请填写您的微信号';
      if (!d.reporterPhone.trim()) return '请填写您的手机号';
      return null;
    }
    return null;
  },
});
