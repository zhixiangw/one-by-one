const Api = require('../../../utils/request.js')
Page({
  data:{
    order: {},
    totalMoney: '',
    showPopup: { type: '', value: false },
    selectedIndex: {
      mpdhq: -1,
      dydhq: -1,
      hmgyt: -1,
    }, // 默认选择第一张优惠券
    movies_vouchers: [], // 电影兑换券
    snacks_vouchers: [], // 小吃兑换券
    vipCard: [], // vip会员卡
  },
  onLoad(params){
    const values = wx.getStorageSync('order_confirm') || "{}"
    const { movies_vouchers = [], snacks_vouchers = [], vipCard = [] } = JSON.parse(values)
    const order = params.orderInfo ? JSON.parse(decodeURIComponent(params.orderInfo)) : {}
    const selectedIndex = {
      mpdhq: snacks_vouchers.findIndex(v => v.check),
      dydhq: movies_vouchers.findIndex(v => v.check),
      hmgyt: vipCard.findIndex(v => v.check),
    }
    this.setData({
      movies_vouchers: movies_vouchers.map(v => ({...v, desc: v.desc.split(';')})),
      snacks_vouchers: snacks_vouchers.map(v => ({...v, desc: v.desc.split(';')})),
      vipCard,
      selectedIndex,
      order,
      totalMoney: order.salePrice
    })
  },
  onCouponTap(e){
    const { type } = e.currentTarget.dataset
    this.setData({ showPopup: { type, value: true } })
  },
  onCouponItemTap(e){
    const { index, type, id } = e.currentTarget.dataset
    const { selectedIndex } = this.data
    if (selectedIndex[type] !== index) {
      this.setData({ selectedIndex: { ...selectedIndex, [type]: index } })
      // 电影兑换券需要重新计算价格
      if (type === 'dydhq') {
        this.calcOrderPrice(String(id))
      }
    }
  },
  onPopupClose(){
    const { showPopup } = this.data
    this.setData({ showPopup: { type: showPopup.type, value: false } })
  },
  onAddCard(){
    wx.redirectTo({ url: '/pages/subPages/gyt-bind/gyt-bind' })
  },
  calcOrderPrice(voucherId){
    Api.request({
      url: '/orderPrice',
      method: 'POST',
      data: {
        discountAmount: this.data.totalMoney,
        voucherId,
      },
      success: (res) => {
        const { voucher_amount } = res.data
        this.setData({ totalMoney: voucher_amount })
      }
    })
  },
  payment(){
    const { order = {}, snacks_vouchers, movies_vouchers, selectedIndex } = this.data
    console.log(order)
    const voucher = movies_vouchers[selectedIndex['dydhq']] || {}
    const snacks = snacks_vouchers[selectedIndex['mpdhq']] || {}
    // 先创单
    Api.request({
      url: '/createOrder',
      method: 'POST',
      data: {
        seqNo: order.seqNo,
        seats: order.orderSeats,
        userPhone: order.phone,
        voucherId: voucher.id ? String(voucher.id) : null,
        snacksId: snacks.id ? String(snacks.id) : null
      },
      success: (res) => {
        const { timeStamp, nonceStr, signType, paySign, order_id } = res.data
        wx.requestPayment({
          timeStamp,
          nonceStr,
          package: res.data.package,
          signType,
          paySign,
          success: () => {
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
              fail: (res) => {
                console.log('fail',res)
              },
              complete: () => {
                console.log("1")
                wx.redirectTo({
                  url: `/pages/subPages/movie-order-detail/movie-order-detail?orderId=${order_id}`,
                })
              }
            })
          },
          fail: (res) => {
            console.log('fail', res)
          },
        })
      }
    })
  }
})