const Api = require('../../../utils/request.js')
const app = getApp();
Page({
  data: {
    showTime:'',//影片上映日期
    cityCinemaInfo: {}, //影院过滤菜单
    params: { //影院搜索条件
      movieId: 0,
      offset: 0,
      limit: 20,
      cityId: 0
    },
    cinemas: [], //影院列表 
    loadComplete: false, //数据是否加载完
    noSchedule: false //当天是否有场次，原本时间是由后台返回的，但是缺少城市ID就没有返回，导致当天可能没有播放场次
  },
  onLoad(options) {
    const location = app.globalData.userLocation
    if (location) {
      this.setData({
        city: app.globalData.selectCity ? app.globalData.selectCity.cityName : '定位失败',
        params: { ...this.data.params, lat: location.latitude, lng: location.longitude, cityId: location.cityId }
      }, () => this.initPage(options))
    } else {
      this.initPage(options)
    }
  },
  initPage(options){
    const movieId = options.movieId
    const movieName = options.movieName
    const showTime = options.showTime //影片上映日期
    wx.setNavigationBarTitle({
      title: movieName
    })
    this.setData({
      showTime,
      params: {
        ...this.data.params,
        movieId
      }
    })
  },
  //获取影院列表
  getCinemas(params) {
    const _this = this;
    return new Promise((resolve, reject) => {
      Api.request({
        url: `/movie?forceUpdate=${Date.now()}`,
        method: 'POST',
        data: params,
        success(res) {
          // 缺少了城市ID所以返回值缺少showDays，只能自己模拟时间了
          resolve(res.data.cinemas)
          _this.setData({
            cinemas: _this.data.cinemas.concat(res.data.cinemas),
            loadComplete: !res.data.paging.hasMore
          })
        }
      })
    })
  },
  //当选择的时间变化时触发
  changeTime(e){
    console.log(222)
    const day = e.detail.day
    this.setData({
      params: { ...this.data.params,day},
      cinemas: [],
      noSchedule: false
    },()=>{
      wx.showLoading({
        title: '正在加载...'
      })
      this.getCinemas(this.data.params).then((list) => {
        wx.hideLoading()
        if (!list.length) {
          this.setData({
            noSchedule: true
          })
        }
      })
    })
  },
  //上拉触底加载更多
  onReachBottom() {
    if (this.data.loadComplete) {
      return
    }
    const params = {
      ...this.data.params,
      offset: this.data.cinemas.length
    }
    this.getCinemas(params)
  }
})