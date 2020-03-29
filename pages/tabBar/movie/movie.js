const Api = require('../../../utils/request.js')
const app = getApp()

Page({
  data: {
    scrollViewHeight: app.globalData.systemInfo.windowHeightRpx - 280 - 134 - 90,
    cityTop: app.globalData.systemInfo.menuTop,
    city: '正在定位...',
    banner: [],
    interval: 5000,
    duration: 1000,
    switchItem: 0, //默认选择‘正在热映’
    //‘正在热映’数据
    movieList0: [],
    movieIds0: [],
    loadComplete0: false, //‘正在上映’数据是否加载到最后一条
    //‘即将上映’数据
    mostExpectedList: [],
    movieList1: [],
    movieIds1: [],
    loadComplete1: false,
    loadComplete2: false //水平滚动加载的数据是否加载完毕
  },
  onLoad() {
    this.initPage();
  },
  initPage() {
    //https://www.jianshu.com/p/aaf65625fc9d   解释的很好
    if (app.globalData.userLocation) {
      this.setData({
        city: app.globalData.selectCity ? app.globalData.selectCity.cityName : '定位失败'
      })
    } else {
      app.userLocationReadyCallback = () => {
        this.setData({
          city: app.globalData.selectCity ? app.globalData.selectCity.cityName : '定位失败'
        })
      }
    }
    this.firstLoad()
  },
  onShow() {
    if (app.globalData.selectCity) {
      this.setData({
        city: app.globalData.selectCity.cityName
      })
    }
  },
  loadmore() {
    const {
      switchItem,
      movieList0,
      movieIds0,
      loadComplete0,
      movieList1,
      movieIds1,
      loadComplete1
    } = this.data
    if (this.data.switchItem === 0) {
      this.ReachBottom(movieList0, movieIds0, loadComplete0, 0)
    } else {
      this.ReachBottom(movieList1, movieIds1, loadComplete1, 1)
    }
  },
  //第一次加载页面时请求‘正在热映的数据’
  firstLoad() {
    const _this = this
    wx.showLoading({
      title: '正在加载...'
    })
    Api.request({
      url: '/movieOnInfoList',
      success(res) {
        const movieList0 = _this.formatImgUrl(res.data.movieList)
        wx.hideLoading()
        _this.setData({
          movieIds0: res.data.movieIds,
          movieList0,
          banner: res.data.banner || []
        })
        if (!res.data.movieIds || res.data.movieList.length >= res.data.movieIds.length) {
          _this.setData({
            loadComplete0: true
          })
        }
      }
    })
  },
  //切换swtch
  selectItem(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      switchItem: item
    })
    if (item === 1 && !this.data.mostExpectedList.length) {
      wx.showLoading({
        title: '正在加载...'
      })
      const _this = this
      Api.request({
        url: '/mostExpected',
        data: {
          limit: 10,
          token: wx.getStorageSync('tokenId')
        },
        success(res) {
          wx.hideLoading()
          _this.setData({
            mostExpectedList: _this.formatImgUrl(res.data.coming, true)
          })
        }
      })
      Api.request({
        url: '/comingList',
        data: {
          limit: 10,
          token: wx.getStorageSync('tokenId')
        },
        success(res) {
          wx.hideLoading()
          _this.setData({
            movieIds1: res.data.movieIds,
            movieList1: _this.formatImgUrl(res.data.coming)
          })
        }
      })
    }
  },
  //上拉触底刷新的加载函数
  ReachBottom(list, ids, complete, item) {
    const _this = this
    if (complete) {
      wx.showToast({
        title: '没有更多了',
        icon: 'none',
        duration: 1500
      })
      return
    }
    const length = list.length
    if (length + 10 >= ids.length) {
      this.setData({
        [`loadComplete${item}`]: true
      })
    }
    let query = ids.slice(length, length + 10).join('%2C')
    wx.showLoading({
      title: '正在加载...'
    })
    Api.request({
      url: `/moreComingList?`,
      data: {
        movieIds: query
      },
      success(res) {
        const arr = list.concat(_this.formatImgUrl(res.data.coming))
        wx.hideLoading()
        _this.setData({
          [`movieList${item}`]: arr,
        })
      }
    })
  },
  //滚动到最右边时的事件处理函数
  lower() {
    const {
      mostExpectedList,
      loadComplete2
    } = this.data
    const length = mostExpectedList.length
    const _this = this
    if (loadComplete2) {
      wx.showToast({
        title: '没有更多了',
        icon: 'none',
        duration: 1500
      })
      return
    }
    wx.showLoading({
      title: '正在加载...'
    })
    Api.request({
      url: '/mostExpected',
      data: {
        limit:10,
        offset: length
      },
      success(res) {
        wx.hideLoading()
        _this.setData({
          mostExpectedList: mostExpectedList.concat(_this.formatImgUrl(res.data.coming, true)),
          loadComplete2: !res.data.paging.hasMore || !res.data.coming.length //当返回的数组长度为0时也认为数据请求完毕
        })
      }
    })
  },
  //处理图片url
  formatImgUrl(arr, cutTitle = false) {
    //小程序不能在{{}}调用函数，所以我们只能在获取API的数据时处理，而不能在wx:for的每一项中处理
    if (!Array.isArray(arr)) {
      return
    }
    let newArr = []
    arr.forEach(item => {
      let title = item.comingTitle
      if (cutTitle) {
        title = item.comingTitle.split(' ')[0]
      }
      let imgUrl = item.img.replace('w.h', '128.180')
      newArr.push({ ...item,
        comingTitle: title,
        img: imgUrl
      })
    })
    return newArr
  },
  //转发
  onShareAppMessage(res) {
    return {
      title: '快来看看附近的电影院',
      path: 'pages/tabBar/movie/movie'
    }
  }
})