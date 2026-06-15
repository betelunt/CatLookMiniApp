// 添加/编辑猫咪档案
const { getCatById, addCat, updateCat } = require('../../data/mock');
const { BREEDS, CAT_STATUS, STATUS_COLORS, GENDER_OPTIONS, GENDER_VALUES, generateArchiveCode } = require('../../utils/constants');

Page({
  data: {
    isEdit: false, id: null, archiveCode: '', regionCodes: [],
    form: {
      name: '', breed: '', region: ['', '', ''], status: '健康',
      age: '', is_neutered: false, gender: null,
      personality: '', appearance: '',
      special_notes: '',
      adoption_status: 'none',
    },
    breeds: BREEDS,
    statuses: CAT_STATUS,
    adoptionStatuses: ['不找领养', '找领养中'],
    adoptionValues: ['none', 'seeking'],
    adoptionStatusIndex: 0,
    statusColors: STATUS_COLORS,
    genderOptions: GENDER_OPTIONS,
    genderValues: GENDER_VALUES,
    photoPath: '', photoUrl: '',
    submitting: false,
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, id: options.id });
      this.loadCat(options.id);
    }
  },

  async loadCat(id) {
    try {
      let c;
      if (getApp().globalData.DEV_MODE) {
        c = getCatById(id);
      } else {
        const { select } = require('../../utils/supabase');
        const cats = await select('cats', { filters: { id } });
        c = cats && cats[0];
      }
      if (c) {
        // 解析城市字段为 region 数组
        const cityParts = (c.city || '').split(' ');
        this.setData({
          form: {
            name: c.name || '', breed: c.breed || '',
            region: [cityParts[0] || '', cityParts[1] || '', ''],
            status: c.health_status || '健康', age: c.age || '',
            is_neutered: !!c.is_neutered, personality: c.personality || '',
            appearance: c.appearance || c.description || '',
            special_notes: c.special_notes || '',
            adoption_status: c.adoption_status || 'none',
            gender: c.gender || null,
          },
          adoptionStatusIndex: (c.adoption_status === 'seeking') ? 1 : 0,
          photoUrl: c.photo_url || '',
          archiveCode: c.archive_code || '',
        });
      }
    } catch (e) { console.error(e); }
  },

  onChoosePhoto() {
    const that = this;
    wx.chooseImage({
      count: 1, sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success(res) {
        const tempPath = res.tempFilePaths[0];
        // 🔧 压缩图片到 300KB 左右再保存（大幅减少存储流量）
        wx.compressImage({
          src: tempPath,
          quality: 65,
          compressedWidth: 800,  // 小程序展示 800px 足够
          success(compressRes) {
            const compressedPath = compressRes.tempFilePath;
            const fs = wx.getFileSystemManager();
            const savedPath = `${wx.env.USER_DATA_PATH}/cat_photo_${Date.now()}.jpg`;
            try {
              fs.saveFileSync(compressedPath, savedPath);
              that.setData({ photoPath: savedPath, photoUrl: '' });
            } catch (e) {
              that.setData({ photoPath: compressedPath, photoUrl: '' });
            }
          },
          fail() {
            // 压缩失败兜底：直接用原图
            const fs = wx.getFileSystemManager();
            const savedPath = `${wx.env.USER_DATA_PATH}/cat_photo_${Date.now()}.jpg`;
            try {
              fs.saveFileSync(tempPath, savedPath);
              that.setData({ photoPath: savedPath, photoUrl: '' });
            } catch (e) {
              that.setData({ photoPath: tempPath, photoUrl: '' });
            }
          },
        });
      },
    });
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`form.${field}`]: e.detail.value });
  },
  onSelect(e) {
    const { field } = e.currentTarget.dataset;
    const idx = Number(e.detail.value);
    if (field === 'breed') this.setData({ 'form.breed': this.data.breeds[idx] });
    else if (field === 'status') this.setData({ 'form.status': this.data.statuses[idx] });
    else if (field === 'gender') this.setData({ 'form.gender': this.data.genderValues[idx] });
    else if (field === 'adoption_status') this.setData({
      'form.adoption_status': this.data.adoptionValues[idx],
      adoptionStatusIndex: idx,
    });
  },
  onRegionChange(e) {
    this.setData({
      'form.region': e.detail.value,   // ['广东省', '广州市', '天河区']
      regionCodes: e.detail.code,      // ['440000', '440100', '440106']
    });
  },
  onSwitch(e) {
    this.setData({ 'form.is_neutered': e.detail.value });
  },

  async onSubmit() {
    const f = this.data.form;
    if (!f.name.trim()) { wx.showToast({ title: '请填写猫咪名字', icon: 'none' }); return; }

    this.setData({ submitting: true });
    try {
      const city = f.region[0] ? `${f.region[0]} ${f.region[1] || ''}`.trim() : '';

      if (getApp().globalData.DEV_MODE) {
        const payload = {
          name: f.name.trim(),
          breed: f.breed,
          city,
          health_status: f.status,
          age: f.age,
          is_neutered: f.is_neutered,
          personality: f.personality.trim(),
          description: f.appearance.trim(),
          special_notes: f.special_notes.trim(),
          photo_url: this.data.photoPath || this.data.photoUrl || '',
          adoption_status: f.adoption_status,
          gender: f.gender,
        };
        if (this.data.isEdit) {
          updateCat(this.data.id, payload);
        } else {
          payload.archive_code = generateArchiveCode(f.breed, this.data.regionCodes);
          addCat(payload);
        }
        wx.showToast({ title: this.data.isEdit ? '✅ 更新成功' : '✅ 创建成功' });
        setTimeout(() => wx.navigateBack(), 800);
        this.setData({ submitting: false });
        return;
      }

      // 真实 API: 写入 Supabase
      const { insert, update } = require('../../utils/supabase');
      const payload = {
        name: f.name.trim(),
        breed: f.breed,
        city,
        health_status: f.status,
        age: f.age,
        is_neutered: f.is_neutered,
        personality: f.personality.trim(),
        appearance: f.appearance.trim(),
        special_notes: f.special_notes.trim(),
        adoption_status: f.adoption_status,
        gender: f.gender,
        created_by: getApp().globalData.userId,
      };

      if (this.data.isEdit) {
        await update('cats', this.data.id, payload);
      } else {
        payload.archive_code = generateArchiveCode(f.breed, this.data.regionCodes);
        await insert('cats', payload);
      }
      wx.showToast({ title: '保存成功' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (e) {
      console.error(e);
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
    this.setData({ submitting: false });
  },
});
