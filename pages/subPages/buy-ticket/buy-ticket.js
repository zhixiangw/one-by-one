Page({
  data:{
    order: {},
  },
  onLoad(params){
    this.setData({ order: wx.getStorageSync('ticketInfo') })
  },
  //模拟支付
  payment(){
    wx.showModal({
      title: '支付结果',
      content: '支付完成',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/subPages/movie-order/movie-order'
          })
        }
      }
    })
  }
})