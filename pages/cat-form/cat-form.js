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
    genderIndex: 0,
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
        // 解析合并后的 description 回三个表单字段
        const desc = c.description || '';
        const descParts = {};
        desc.split(' | ').forEach(part => {
          const m = part.match(/^(.+?)：(.+)$/);
          if (m) descParts[m[1]] = m[2];
        });
        this.setData({
          form: {
            name: c.name || '', breed: c.breed || '',
            region: [cityParts[0] || '', cityParts[1] || '', ''],
            status: c.health_status || '健康', age: c.age || '',
            is_neutered: !!c.is_neutered,
            personality: descParts['性格'] || '',
            appearance: descParts['外观'] || c.description || '',
            special_notes: descParts['特别提示'] || '',
            adoption_status: c.adoption_status || 'none',
            gender: c.gender || null,
          },
          adoptionStatusIndex: (c.adoption_status === 'seeking') ? 1 : 0,
          genderIndex: c.gender === 'female' ? 2 : (c.gender === 'male' ? 1 : 0),
          photoUrl: c.photo_url || '',
          archiveCode: c.archive_code || '',
        });
      }
    } catch (e) { console.error(e); }
  },

  onChoosePhoto() {
    console.log('[cat-form] onChoosePhoto triggered');
    const that = this;
    const openPicker = () => {
      console.log('[cat-form] calling wx.chooseImage...');
      wx.chooseImage({
        count: 1, sizeType: ['compressed'],
        sourceType: ['camera', 'album'],
        success(res) {
          const tempPath = res.tempFilePaths[0];
          wx.compressImage({
            src: tempPath, quality: 65, compressedWidth: 800,
            success(compressRes) {
              const compressedPath = compressRes.tempFilePath;
              const fs = wx.getFileSystemManager();
              const savedPath = `${wx.env.USER_DATA_PATH}/cat_photo_${Date.now()}.jpg`;
              try { fs.saveFileSync(compressedPath, savedPath); that.setData({ photoPath: savedPath, photoUrl: '' }); }
              catch (e) { that.setData({ photoPath: compressedPath, photoUrl: '' }); }
            },
            fail() {
              const fs = wx.getFileSystemManager();
              const savedPath = `${wx.env.USER_DATA_PATH}/cat_photo_${Date.now()}.jpg`;
              try { fs.saveFileSync(tempPath, savedPath); that.setData({ photoPath: savedPath, photoUrl: '' }); }
              catch (e) { that.setData({ photoPath: tempPath, photoUrl: '' }); }
            },
          });
        },
        fail(err) {
          console.error('chooseImage failed:', err);
          if (err.errMsg && err.errMsg.includes('auth deny')) {
            wx.showToast({ title: '需要相册/相机权限', icon: 'none' });
          }
        },
      });
    };
    // 先触发隐私授权 → 通过后再调 chooseImage
    // onNeedPrivacyAuthorization 全局监听负责弹自定义 modal
    if (wx.requirePrivacyAuthorize) {
      wx.requirePrivacyAuthorize({ success: () => openPicker(), fail: () => openPicker() });
    } else {
      openPicker();
    }
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`form.${field}`]: e.detail.value });
  },
  onSelect(e) {
    const { field } = e.currentTarget.dataset;
    const idx = Number(e.detail.value);
    console.log('[cat-form] onSelect:', field, idx);
    if (field === 'breed') this.setData({ 'form.breed': this.data.breeds[idx] });
    else if (field === 'status') this.setData({ 'form.status': this.data.statuses[idx] });
    else if (field === 'gender') {
      const val = this.data.genderValues[idx];
      console.log('[cat-form] gender picker:', idx, '→', val, 'display:', this.data.genderOptions[idx]);
      this.setData({ 'form.gender': val, genderIndex: idx });
    }
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

      // 真实 API: 上传照片 → 写入 Supabase
      const { insert, update, uploadFile, SUPABASE_URL } = require('../../utils/supabase');

      // 如果有新选择的照片，先上传到 Storage
      let photoUrl = this.data.photoUrl; // 已有照片 URL（编辑模式）
      if (this.data.photoPath) {
        try {
          const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
          await uploadFile('cat_photos', filename, this.data.photoPath);
          photoUrl = `${SUPABASE_URL}/storage/v1/object/cat_photos/${filename}`;
        } catch (e) {
          console.error('照片上传失败:', e);
          // 上传失败不阻塞提交，但提示用户
          wx.showToast({ title: '照片上传失败，数据已保存', icon: 'none' });
        }
      }

      // 字段降维映射：personality / appearance / special_notes 不存在于 DB
      // 拼接进 description 字段
      const descParts = [];
      if (f.personality.trim()) descParts.push('性格：' + f.personality.trim());
      if (f.appearance.trim()) descParts.push('外观：' + f.appearance.trim());
      if (f.special_notes.trim()) descParts.push('特别提示：' + f.special_notes.trim());
      const description = descParts.length > 0 ? descParts.join(' | ') : null;

      const payload = {
        name: f.name.trim(),
        breed: f.breed || null,
        city: city || null,
        health_status: f.status,
        age: f.age || null,
        is_neutered: f.is_neutered || null,
        description,
        photo_url: photoUrl || null,
        adoption_status: f.adoption_status,
        gender: f.gender || null,
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
