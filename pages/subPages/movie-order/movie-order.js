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
      url: `/orderList?type=[1,2,3,4,5]`,
      success(res) {
        const { items } = res.data
        _this.setData({
          orderList: items.map(o => {
            return {
              id: o.id,
              status: o.status,
              cinemaName: o.ciname.name,
              cinemaId: o.ciname.cinema_id,
              movieImg: o.movie.img.replace('w.h', '108.150'),
              movieName: o.movie.name,
              seatCount: o.seats.length,
              time: o.show_time,
              hall: o.hall,
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
  goTo(e){
    const orderId = e.currentTarget.dataset.orderid
    const order = this.data.orderList.find(o => o.id == orderId)
    if (order.status == 3) {
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