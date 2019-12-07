Page({
  data:{
    order: {},
    pkg: {},
  },
  onLoad(params){
    this.setData({ 
      order: {
        totalMoney: 0.01
      },
      pkg: JSON.parse(decodeURIComponent(params.pkg)) || {}
    })
  },
  //模拟支付
  payment(){
    const { pkg = {} } = this.data
    const { timeStamp, nonceStr, signType, paySign } = pkg;
    wx.requestPayment({
      timeStamp,
      nonceStr,
      package: pkg.package,
      signType,
      paySign,
      success: (res) => {
        wx.redirectTo({
          url: '/pages/subPages/movie-order/movie-order',
        })
      },
      fail: (res) => {
        console.log('fail', res)
      },
    })
  }
})