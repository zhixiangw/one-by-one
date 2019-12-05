const Api = require('../../../utils/request.js')
Page({
  data: {
    type: 0
  },
  onLoad: function (options) {
    const _this = this;
    _this.setData({ type: options.type })
    wx.getSetting({
      success(res){
        // 如果授过权了
        if (res.authSetting['scope.userInfo']) {
          _this.interfaceLogin()
        }
      }
    })
  },
  bindgetphonenumber(res) {
    console.log(res)
  },
  bindgetuserinfo(res) {
    if (res.detail.iv) {
      this.wxlogin(code => {
        const { encryptedData, iv } = res.detail
        // 请求登录接口，获取token，并储存到storage
        wx.setStorageSync('userinfo', { code, encryptedData, iv })
        this.interfaceLogin()
      })
    }
  },
  wxlogin(success) {
    wx.login({
      success: res => {
        success && success(res.code)
      }
    })
  },
  interfaceLogin() {
    const { code, encryptedData, iv } = wx.getStorageSync('userinfo')
    Api.request({
      url: '/login',
      method: 'post',
      data: {
        code,
        encryptedData,
        iv
      },
      success(res) {
        console.log(res)
        wx.setStorageSync('token', res.token)

        wx.navigateBack({
          delta: 1
        })
      }
    })
  }
})