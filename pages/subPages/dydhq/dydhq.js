const Api = require('../../../utils/request.js')
Page({

  data: {
    isEmpty: false,
    list: []
  },
  onShow: function () {
    const _this = this
    wx.showLoading({
      title: '正在加载...',
    })
    Api.request({
      url: '/movieVouchers',
      success(res) {
        wx.hideLoading()
        const items  = res.data.items || []
        if (items.length) {
          _this.setData({
            list: items.map(v => ({
              ...v,
              desc: v.desc.split(';')
            }))
          })
        } else {
          _this.setData({
            isEmpty: true
          })
        }
      }
    })
  },
})