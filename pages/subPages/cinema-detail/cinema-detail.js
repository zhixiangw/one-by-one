const util = require('../../../utils/util.js')
const Api = require('../../../utils/request.js')
const getRandom = util.getRandom
Page({
  data: {
    cinemaId: '',
    movieId: '',
    cinemaDetail: null, //影院详情
    movie: null, //选中的电影
    movies:null, //电影列表
    days: [], //该电影的排片日期列表
    timeList: [], //当天播放电影的时间段
  }, 
  onLoad(query) {
   this.initPage(query)
  },
  //初始化页面
  initPage(query) {
    const { cinemaId = '', movieId = '', day = '' } = query
    this.setData({
      cinemaId,
      movieId,
      day
    })
    const _this = this
    wx.showLoading({
      title: '正在加载...',
    })
    Api.request({
      url: '/cinemaDetail',
      data: {
        cinemaId,
        movieId
      },
      success(res) {
        wx.hideLoading()
        _this.setData({
          cinemaDetail: res.data,
          movies: _this.formatMovie(res.data.showData.movies),
        })
      }
    })
  },
  //选择电影
  selectMovie(e) {
    const movie = e.detail.movie
    let days = []
    movie.shows.forEach(item => {
      days.push({
        title: item.dateShow,
        day: item.showDate
      })
    })
    this.setData({
      movie,
      days,
      timeList: this.createEndTime(movie.shows[0].plist, movie.dur)
    })
  },
  //选择时间
  selectDay(e) {
    const day = e.detail.day
    const movie = this.data.movie
    const index = movie.shows.findIndex(item => item.showDate === day)
    this.setData({
      timeList: this.createEndTime(movie.shows[index].plist, movie.dur)
    })
  },
  //购票
  buyTicket(e){
    const movie = this.data.movie;
    const info = e.currentTarget.dataset.info;
    wx.navigateTo({
      url: `/pages/subPages/seat-select/seat-select?seqNo=${info.seqNo}&movieImg=${movie.img}`,
    })
  },
  //处理散场时间
  createEndTime(arr, dur) {
    let timeList = []
    if (Array.isArray(arr)) {
      timeList = arr.map(item => {
        let temp = { ...item
        }
        const [hour, min] = item.tm.split(':').map(v => Number(v))
        const durH = Math.floor(dur / 60)
        const durM = dur - durH * 60
        let endTime = [durH + hour, min + durM]
        if (min + durM > 60) {
          endTime = [durH + hour + 1, min + durM - 60]
        }
        temp.endTime = endTime.join(':')
        return temp
      })
    }
    return timeList
  },
  //处理电影图片的url
  formatMovie(movies){
    const keys = Object.keys(movies)
    let list = []
    keys.forEach(key => {
      const item = movies[key];
      list.push({
        ...item,
        id: key,
        img: item.img.replace('w.h', '148.208')
      })
    })
    return list
  },
})