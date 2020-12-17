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
    selectedDesc: {
      mpdhq: '无可用',
      dydhq: '无可用',
      hmgyt: '无可用',
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
    const selectedDesc = {
      mpdhq: this.getDesc(snacks_vouchers, selectedIndex.mpdhq),
      dydhq: this.getDesc(movies_vouchers, selectedIndex.dydhq),
      hmgyt: this.getDesc(vipCard, selectedIndex.hmgyt),
    }
    this.setData({
      movies_vouchers: movies_vouchers.map(v => ({...v, desc: v.desc.split(';')})),
      snacks_vouchers: snacks_vouchers.map(v => ({...v, desc: v.desc.split(';')})),
      vipCard,
      selectedIndex,
      selectedDesc,
      order,
      totalMoney: order.voucher_amount
    })
  },
  getDesc(list, index){
    if (index > -1) {
      return (list[index].show_title || list[index].name) + ' ' + list[index].show_discount
    }
    return '无可用'
  },
  onCouponTap(e){
    const { type } = e.currentTarget.dataset
    this.setData({ showPopup: { type, value: true } })
  },
  onCouponItemTap(e){
    const { index, type, id } = e.currentTarget.dataset
    const { selectedIndex, selectedDesc, snacks_vouchers, movies_vouchers, vipCard } = this.data
    let list = []
    if (type === 'mpdhq') {
      list = snacks_vouchers
    } else if (type === 'dydhq') {
      list = movies_vouchers
    } else {
      list = vipCard
    }
    if (selectedIndex[type] !== index) {
      this.setData({ 
        selectedIndex: { ...selectedIndex, [type]: index },
        selectedDesc: {
          ...selectedDesc,
          [type]: this.getDesc(list, index),
        }
      })
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
  calcOrderPrice(voucher_id){
    const { order } = this.data
    Api.request({
      url: '/orderPrice',
      method: 'POST',
      data: {
        vip_amount: String(order.vip_amount),
        voucher_id,
      },
      success: (res) => {
        const { voucher_amount, useVoucher = {} } = res.data
        this.setData({ 
          totalMoney: voucher_amount,
          'selectedDesc.dydhq': useVoucher.show_title + ' ' + useVoucher.show_discount
        })
      }
    })
  },
  payment(){
    const { order = {}, snacks_vouchers, movies_vouchers, selectedIndex } = this.data
    const voucher = movies_vouchers[selectedIndex['dydhq']] || {}
    const snacks = snacks_vouchers[selectedIndex['mpdhq']] || {}
    // 先创单
    Api.request({
      url: '/createOrder',
      method: 'POST',
      data: {
        seqNo: order.seqNo,
        seats: JSON.stringify(order.orderSeats),
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