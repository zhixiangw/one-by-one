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
        wx.requestSubscribeMessage({
          tmplIds: [
            'XamayYPbc8pidJL7BXI4Mmptxv0gSz_qdoqi_dYMhg8',
            'esvzRq38cegYlEgMCDgFIssc9Im1Ums1VF_WX3F1RZE'
          ],
          success: (res) => {
            if (res.errMsg === 'requestSubscribeMessage:ok') {
              console.log('允许订阅消息')
            }
          },
          complete: () => {
            wx.redirectTo({
              url: `/pages/subPages/movie-order-detail/movie-order-detail?orderId=${pkg.order_id}`,
            })
          }
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
            time: order.show_time,
            lang: `${movie.ori_lang}${movie.ver}`,
            cinemaName: cinema.name,
            hall: order.hall,
            phone: order.phone,
            price: order.price,
            salePrice: order.sell_price,
            seat: order.seatsText.join(','),
            totalMoney: order.amount
          }
        })
      }
    })
  },
  getSeatsName(seats) {
    let seatArr = []
    for (let i = 0; i < seats.length; i++) {
      const name = seats[i]
      seatArr.push(name)
    }
    return seatArr.join(',')
  }
})