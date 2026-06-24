// 拍照识配料 — 拍照 + 预览确认
const LOADING_TIPS = [
  '拍照时请确保光线充足 🔦',
  '配料表通常在包装背面或侧面',
  '尽量把配料表放在取景框中央',
  'AI 正在逐行分析每种成分...',
  '猫咪是专性肉食动物哦 🐱',
];

Page({
  data: {
    step: 'camera',   // 'camera' | 'preview' | 'loading'
    photoPath: '',    // 照片临时路径
    photoOK: true,    // 照片是否清晰
    stepIndex: 1,     // 1/2/3 对应步骤指示器
    loadingTip: LOADING_TIPS[0],
    showScanLine: false,
  },

  _tipTimer: null,

  /** 拍照（真机调用摄像头 / 开发者工具降级到相册） */
  takePhoto() {
    this._pickImage(['camera', 'album']);
  },

  /** 从相册选 */
  pickFromAlbum() {
    this._pickImage(['album']);
  },

  /** 选择图片 */
  _pickImage(sourceType) {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType,
      sizeType: ['compressed'],
      success(res) {
        that.setData({ step: 'preview', stepIndex: 2, photoPath: res.tempFiles[0].tempFilePath, photoOK: true });
      },
      fail(err) {
        if (err.errMsg.indexOf('cancel') !== -1) return;
        console.error('[scan] chooseMedia failed:', err);
        wx.showModal({
          title: '选择失败',
          content: '请确保已在微信后台「隐私保护设置」中声明了相册和摄像头权限。\n\n如已声明，请等待审核通过后再试。',
          showCancel: false,
          confirmText: '我知道了',
        });
      },
    });
  },

  /** 重拍 */
  retake() {
    this.setData({ step: 'camera', stepIndex: 1, photoPath: '', photoOK: true });
  },

  /** 确认识别 → 上传云函数 OCR */
  async confirmScan() {
    this.setData({ step: 'loading', stepIndex: 3, showScanLine: true });

    // 启动文案轮播
    let tipIdx = 0;
    this._tipTimer = setInterval(() => {
      tipIdx = (tipIdx + 1) % LOADING_TIPS.length;
      this.setData({ loadingTip: LOADING_TIPS[tipIdx] });
    }, 2500);

    try {
      const fs = wx.getFileSystemManager();
      const base64 = fs.readFileSync(this.data.photoPath, 'base64');

      const res = await wx.cloud.callFunction({
        name: 'ocr-ingredients',
        data: { imageBase64: base64 },
      });

      this._clearTipTimer();

      if (!res.result || !res.result.ok) {
        throw new Error(res.result?.error || 'OCR 识别失败');
      }

      wx.redirectTo({
        url: `/pages/ingredient-result/ingredient-result?data=${encodeURIComponent(JSON.stringify(res.result.ingredients))}`,
      });
    } catch (e) {
      this._clearTipTimer();
      console.error('OCR failed:', e);
      wx.showModal({
        title: '识别失败',
        content: '请确保照片中配料表清晰可见，重新拍摄试试~',
        confirmText: '重拍',
        success: (modalRes) => {
          if (modalRes.confirm) this.setData({ step: 'camera', stepIndex: 1, photoPath: '', showScanLine: false });
        },
      });
    }
  },

  _clearTipTimer() {
    if (this._tipTimer) {
      clearInterval(this._tipTimer);
      this._tipTimer = null;
    }
  },

  onUnload() {
    this._clearTipTimer();
  },
});
