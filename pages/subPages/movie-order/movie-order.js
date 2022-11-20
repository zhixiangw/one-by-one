const Api = require('../../../utils/request.js')
Page({
  data:{
    orderList:[]
  },
  onLoad(){
  },
  onShow(){
    this.initData()
  },
  initData(){
    const _this = this;
    Api.request({
      url: `/orderList?type=[1,2,4,5]`,
      success(res) {
        const { items } = res.data
        _this.setData({
          orderList: items.map(o => {
            return {
              id: o.id,
              status: o.status,
              cinemaName: o.ciname.name,
              cinemaId: o.ciname.cinema_id,
              movieImg: o.movie && o.movie.img ? o.movie.img.replace('w.h', '108.150') : '',
              movieName: o.movie.name,
              seatCount: o.seats.length,
              time: o.show_time,
              hall: o.hall,
              canPay: o.can_pay,
              seat: o.seatsText && o.seatsText.join(','),
              totalMoney: o.amount,
              statusName: o.statusText
            }
          })
        })
      }
    })
  },
  //跳转到订单详情页面
  goTo(e) {
    const orderId = e.currentTarget.dataset.orderid
    const order = this.data.orderList.find(o => o.id == orderId)
    if (order.status == 3) {
      if (!order.canPay) {
        return wx.showToast({
          title: '订单已过期，无法继续支付',
          duration: 2000,
          icon: 'none'
        })
      }
      Api.request({
        url: `/orderPayParams?order_id=${orderId}`,
        success(res) {
          wx.navigateTo({ url: `/pages/subPages/buy-ticket/buy-ticket?pkg=${encodeURIComponent(JSON.stringify(res.data))}` })
        }
      })
    } else {
      wx.navigateTo({ url: `/pages/subPages/movie-order-detail/movie-order-detail?orderId=${orderId}` })
    }
  }
})