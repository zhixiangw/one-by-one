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
    const _this = this;
    const { code, encryptedData, iv } = wx.getStorageSync('userinfo')
    Api.request({
      url: '/login',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        code,
        encryptedData,
        iv
      },
      success(res) {
        const storage = wx.getStorageSync('userinfo')
        wx.setStorageSync('userinfo', { ...storage, openid: res.data.openid })
        wx.setStorageSync('tokenId', res.data.tokenId)
        wx.navigateBack({
          delta: 1
        })
      },
      fail(res) {
        // code 失效了，被使用过了
        if (res.code == 405) {
          _this.setData({ type: res.code })
          wx.login({
            success: res => {
              const storage = wx.getStorageSync('userinfo')
              wx.setStorageSync('userinfo', { ...storage, code: res.code })
              _this.interfaceLogin()
            }
          })
        }
      }
    })
  }
})