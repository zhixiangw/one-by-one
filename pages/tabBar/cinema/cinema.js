const util = require('../../../utils/util.js')
const Api = require('../../../utils/request.js')

const app = getApp();
Page({
  data: {
    city: '正在定位...',
    params: { //url请求参数对象
      day: util.getToday(),
      offset: 0,
      limit: 20
    },
    nothing: false, //结果是否为空
    cinemas: [], //影院列表
    loadComplete: false, //数据是否加载完
  },
  onLoad() {
    if (app.globalData.userLocation) {
      this.setData({
        city: app.globalData.selectCity ? app.globalData.selectCity.cityName : '定位失败',
        params: { ...this.data.params, lat: app.globalData.userLocation.latitude, lng: app.globalData.userLocation.longitude }
      })
    } else {
      app.userLocationReadyCallback = () => {
        this.setData({
          city: app.globalData.selectCity ? app.globalData.selectCity.cityName : '定位失败'
        })
      }
    }
    this.initPage()
  },
  onShow() {
    if (app.globalData.selectCity) {
      this.setData({
        city: app.globalData.selectCity.cityName
      })
    }
  },
  //初始化页面
  initPage() {
    wx.showLoading({
      title: '正在加载...'
    })
    const _this = this;
    this.getCinemas(this.data.params).then(() => {
      wx.hideLoading()
    })
  },
  //获取影院列表
  getCinemas(params) {
    const _this = this;
    return new Promise((resolve, reject) => {
      Api.request({
        url: '/cinemaList',
        data: params,
        success(res) {
          resolve(res.data.cinemas)
          _this.setData({
            cinemas: _this.data.cinemas.concat(res.data.cinemas),
            loadComplete: !res.data.paging.hasMore
          })
        }
      })
    })
  },
  //当过滤条件变化时调用的函数
  changeCondition(e) {
    const obj = e.detail
    wx.showLoading({
      title: '正在加载...'
    })
    this.setData({
      params: { ...this.data.params,
        ...obj
      },
      cinemas: [],
      nothing: false
    }, () => {
      this.getCinemas(this.data.params).then((list) => {
        if (!list.length) {
          this.setData({
            nothing: true
          })
        }
        wx.hideLoading()
      })
    })
  },
  //导航下拉框状态变化时的处理
  toggleShow(e) {
    const item = e.detail.item
    this.setData({
      isShow: item !== -1
    })
  },
  //上拉触底加载更多
  onReachBottom() {
    if (this.data.loadComplete) {
      return
    }
    const params = { ...this.data.params,
      offset: this.data.cinemas.length
    }
    this.getCinemas(params)
  },
  //转发
  onShareAppMessage(res) {
    return {
      title: '最近上映的这些电影你都看了吗？',
      path: 'pages/tabBar/movie/movie'
    }
  }
})