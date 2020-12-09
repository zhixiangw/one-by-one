const Api = require('../../../utils/request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardNo: '',
    password: ''
  },
  onCardNoInput: function(e) {
    this.setData({ cardNo: e.detail.value })
  },
  onPasswordInput: function(e) {
    this.setData({ password: e.detail.value })
  },
  onConfirm: function() {
    const { cardNo, password } = this.data
    if (!cardNo || !password) {
      wx.showToast({
        title: cardNo ? '请输入密码' : '请输入卡号',
        icon: 'none'
      })
      return null;
    }
    // 接口请求
    const _this = this
    wx.showLoading({
      title: '正在加载...',
    })
    Api.request({
      url: '/bindMemberVoucher',
      method: 'POST',
      data: {
        no: cardNo,
        secret: password
      },
      success() {
        wx.hideLoading()
        _this.backToList()
      }
    })
  },
  backToList: function() {
    wx.showToast({ title: '添加成功' })
    setTimeout(() => {
      wx.navigateBack({ delta: 1 })
    }, 2000);
  }
})