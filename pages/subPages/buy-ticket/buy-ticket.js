const Api = require('../../../utils/request.js')
Page({
  data:{
    order: {},
    pkg: {},
    showPopup: { type: '', value: false },
    selectedIndex: {
      mpdhq: 0,
      dydhq: 0,
      hmgyt: 0,
    }, // 默认选择第一张优惠券
    couponList: [{
      title: '爆米花',
      subTitle: '万达电影院兑换券',
      content: ['1、本券可免费兑换一份爆米花', '2、本券不适用其他门店', '3、本券长期效期'],
      validDate: '2020-12-12'
    }, {
      title: '爆米花',
      subTitle: '万达电影院兑换券',
      content: ['1、本券可免费兑换一份爆米花', '2、本券不适用其他门店', '3、本券长期效期'],
      validDate: '2020-12-12'
    },{
      title: '爆米花',
      subTitle: '万达电影院兑换券',
      content: ['1、本券可免费兑换一份爆米花', '2、本券不适用其他门店', '3、本券长期效期'],
      validDate: '2020-12-12'
    }, {
      title: '爆米花',
      subTitle: '万达电影院兑换券',
      content: ['1、本券可免费兑换一份爆米花', '2、本券不适用其他门店', '3、本券长期效期'],
      validDate: '2020-12-12'
    }]
  },
  onLoad(params){
    this.setData({
      pkg: params.pkg ? JSON.parse(decodeURIComponent(params.pkg)) : {}
    }, this.getOrderDetail)
  },
  onCouponTap(e){
    const { type } = e.currentTarget.dataset
    this.setData({ showPopup: { type, value: true } })
  },
  onCouponItemTap(e){
    const { index, type } = e.currentTarget.dataset
    const { selectedIndex } = this.data
    this.setData({ selectedIndex: { ...selectedIndex, [type]: index } })
  },
  onPopupClose(){
    const { showPopup } = this.data
    this.setData({ showPopup: { type: showPopup.type, value: false } })
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
            // 'os7aOn8gERibddo75lXcUMtdTyL6LQ1ErLPL6aOquAg',
            'XamayYPbc8pidJL7BXI4Mmptxv0gSz_qdoqi_dYMhg8',
            'esvzRq38cegYlEgMCDgFIssc9Im1Ums1VF_WX3F1RZE'
          ],
          success: (res) => {
            console.log('success', res)
            if (res.errMsg === 'requestSubscribeMessage:ok') {
              console.log('允许订阅消息')
            }
          },
          fail: (res) => {
            console.log('fail',res)
          },
          complete: () => {
            console.log("1")
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