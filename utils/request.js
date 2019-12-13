const baseUrl = 'https://openapi.wanguo.press/openapi'
const ApiReqest = (config) => {
  wx.request({
    url: `${baseUrl}${config.url}`,
    method: config.method || 'GET',
    data: { ...config.data },
    header: {
      'token-id': wx.getStorageSync('tokenId')
    },
    success(res) {
      if (res.data.code === 0) {
        config.success && config.success(res.data)
      } else if ([401, 402].indexOf(res.data.code) !== -1) {
        // type=401,用户授权基本信息
        // 402,获取用户手机号码
        wx.navigateTo({
          url: `/pages/subPages/authorize/authorize?type=${res.data.code}`,
        })
      } else if (res.data.code == 3) {
        // 登录态过期的操作
        // 重新登录，将token存入storage
      } else {
        config.fail && config.fail(res.data)
      }
    },
    fail(res) {
      config.fail && config.fail(res.data)
    }
  })
}


module.exports = {
  request: ApiReqest
}