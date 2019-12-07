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
      url: `/orderList?type=[1,2,4]`,
      success(res) {
        console.log(res)
        const { items } = res.data
        const statusMap = {
          1: '已完成',
          2: '待支付',
          3: '待支付',
          4: '已退款',
        }
        _this.setData({
          orderList: items.map(o => {
            console.log(o)
            let seatArr = []
            for (let i = 0; i < o.seats.length; i++) {
              const name = o.seats[i]
              seatArr.push(name)
            }
            return {
              cinemaName: o.ciname.name,
              cinemaId: o.ciname.cinema_id,
              movieImg: o.movie.img.replace('w.h', '108.150'),
              movieName: o.movie.name,
              seatCount: o.seats.length,
              time: o.date, // 电影放映时间
              hall: o.ciname.hall, // 几号厅
              seat: seatArr.join(','),
              totalMoney: o.amount,
              statusName: statusMap[o.status]
            }
          })
        })
      }
    })
  },
  //跳转到订单详情页面
  goTo(e){
    const order = e.currentTarget.dataset.order
    const paramsStr = JSON.stringify(order)
    wx.navigateTo({
      url: `../movie-order-detail/movie-order-detail?paramsStr=${paramsStr}`
    })
  }
})