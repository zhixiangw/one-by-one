const util = require('../../../utils/util.js')
const Api = require('../../../utils/request.js')
const app = getApp();

Page({
  data: {
    value: '',
    stype: '',
    placeholder: '',
    cinemas: [],
    hasMore: true,
    offset: 0
  },
  onLoad(query) {
   this.initPage(query)
  },
  initPage(query){
    //搜索类型，-1代表搜索影院或电影，2代表搜索影院
    const stype = query.stype
    let placeholder = ''
    if (stype === '-1') {
      placeholder = '搜电影、搜影院'
    } else {
      placeholder = '搜影院'
    }
    this.setData({
      stype,
      placeholder
    })
  },
  search(e) {
    const value = e.detail.value
    this.setData({
      value,
      offset: 0,
      cinemas: [],
      hasMore: true
    }, this.queryList)
  },
  queryList() {
    const { offset, value, cinemas, hasMore } = this.data
    if (!hasMore) {
      return null;
    }
    const _this = this
    const params = {
      day: util.getToday(),
      offset,
      limit: 20,
      lat: app.globalData.userLocation.latitude,
      lng: app.globalData.userLocation.longitude,
      keyword: value
    }
    Api.request({
      url: '/cinemaList',
      data: params,
      success(res) {
        _this.setData({
          cinemas: cinemas.concat(res.data.cinemas),
          hasMore: res.data.paging.hasMore,
          offset: res.data.paging.hasMore ? offset + 20 : offset
        })
      }
    })
  },
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },
  onReachBottom() {
    this.queryList()
  }
})