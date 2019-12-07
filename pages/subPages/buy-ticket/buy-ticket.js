const Api = require('../../../utils/request.js')
Page({
  data:{
    order: {},
    pkg: {},
  },
  onLoad(params){
    this.setData({
      pkg: JSON.parse(decodeURIComponent(params.pkg)) || {}
    }, this.getOrderDetail)
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
          url: `/pages/subPages/movie-order/movie-order`,
        })
      },
      fail: (res) => {
        console.log('fail', res)
      },
    })
  },
  getOrderDetail() {
    const { pkg: { order_id } } = this.data
    const _this = this;
    Api.request({
      url: `/orderDetail?order_id=${order_id}`,
      success(res) {
        const { cinema, movie, order } = res.data
        _this.setData({
          order: {
            movieImg: movie.img.replace('w.h', '108.150'),
            movieName: movie.name,
            time: '2019-12-08 11:00', // 电影开播时间
            lang: `${movie.ori_lang}${movie.ver}`,
            cinemaName: cinema.name,
            hall: cinema.hall, // 几号厅
            price: order.price || 6, // 电影单价
            salePrice: order.salePrice || 2, // 电影单价优惠售卖价
            seat: _this.getSeatsName(order.seats),
            totalMoney: order.amount
          }
        })
      }
    })
  },
  getSeatsName(seats) {
    let seatArr = []
    for (let i = 0; i < o.seats.length; i++) {
      const name = o.seats[i]
      seatArr.push(name)
    }
    return seatArr.join(',')
  }
})