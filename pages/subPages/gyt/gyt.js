const Api = require('../../../utils/request.js')
Page({

  data: {
    isMember: false,
    isLoading: true,
    cardInfo: {
      cards: [],
      rights: [],
      agreement: [],
    },
  },
  onShow: function () {
    const _this = this
    wx.showLoading({
      title: '正在加载...',
    })
    Api.request({
      url: '/userCenter',
      success(res) {
        const isMember = Boolean(res.data.is_vip)
        _this.setData({ isMember, isLoading: false })
        if (isMember) {
          _this.queryMemberInfo()
        } else {
          wx.hideLoading()
        }
      }
    })
  },
  queryMemberInfo: function() {
    const _this = this
    Api.request({
      url: '/member',
      success(res) {
        wx.hideLoading()
        const cardInfo = res.data
        _this.setData({ cardInfo })
      }
    })
  }
})