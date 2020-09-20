const Api = require('../../../utils/request.js')

Page({
  bindgetphonenumber(res){
    if (res.detail.iv) {
      const { iv, encryptedData } = res.detail
      Api.request({
        url: '/saveUserPhone',
        method: 'post',
        data: {
          iv,
          encryptedData
        },
        success(res) {
          wx.showToast({
            title: '绑定成功',
            icon: 'none'
          })
        }
      })
    }
  },
  subscribeMessage: () => {
    wx.requestSubscribeMessage({
      tmplIds: [
        // 'os7aOn8gERibddo75lXcUMtdTyL6LQ1ErLPL6aOquAg',
        'XamayYPbc8pidJL7BXI4Mmptxv0gSz_qdoqi_dYMhg8', 
        'esvzRq38cegYlEgMCDgFIssc9Im1Ums1VF_WX3F1RZE'
      ],
      success: (res) => {
        wx.showToast({
          title: '您已订阅消息，可点击用户设置按钮进行查看',
          icon: 'none'
        })
      },
    })
  },
  openSetting: () => {
    wx.openSetting()
  },
  onShareAppMessage(res){
    return {
      title:'一起看电影',
      path:'pages/tabBar/movie/movie'
    }
  }
})