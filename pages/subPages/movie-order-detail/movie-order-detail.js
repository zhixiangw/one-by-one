const Api = require('../../../utils/request.js')
Page({
  data:{
    order: {}
  },
  onLoad({ orderId }){
    this.initData(orderId)
  },
  initData(orderId){
    const _this = this;
    Api.request({
      url: `/orderDetail?order_id=${orderId}`,
      success(res) {
        const { cinema, movie, order } = res.data
        const ticketing = order.ticketing || []

        _this.setData({
          order: {
            movieName: movie.name,
            time: order.show_time,
            lang: `${movie.ori_lang}${movie.ver}`,
            cinemaName: cinema.name,
            cinemaId: cinema.cinema_id,
            hall: order.hall,
            ticketArr: order.ticketing.map(i=>({
              value: i,
              text: i.replace(/(\w{4})(?=\w)/g, '$1 ')
            })),
            seat: order.seatsText.join(','),
            status: order.status,
            ticketing: Array.isArray(ticketing) ? ticketing : JSON.parse(ticketing)
          }
        })
      }
    })
  },
  previewImage(e) {
    const currentIndex = e.currentTarget.dataset.index
    const { order } = this.data
    wx.previewImage({
      urls: order.ticketing,
      current: order.ticketing[currentIndex]
    })
  },
})