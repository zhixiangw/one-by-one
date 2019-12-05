const Api = require('../../../utils/request.js')
Page({
  data:{
    movieId: null,
    detailMovie:null,    //电影详情
  },
  onLoad(options){
    const movieId = options.movieId
    this.setData({ movieId })
  },
  onShow(res){
    this.initPage(this.data.movieId)
  },
  //初始页面
  initPage(movieId){
    const _this = this
    wx.showLoading({
      title: '加载中...',
    })
    Api.request({
      url: '/detailmovie',
      data: {
        movieId
      },
      success(res) {
        wx.hideLoading()
        _this.setData({
          detailMovie: _this.handleData(res.data.detailMovie)
        })
      }
    })
  },
  //预览图片
  previewImage(e){
    const currentIndex = e.currentTarget.dataset.index
    const urls = this.data.detailMovie.photos.map(item => item.split('@')[0])
    wx.previewImage({
      urls,
      current: urls[currentIndex]
    })
  },
  //处理数据
  handleData(data){
    //小程序的{{}}中不能调用函数，只能在这里处理数据
    let obj = data
    obj.img = obj.img.replace('w.h','177.249')
    //将类似“v3d imax”转化为['3D','IMAX']
    obj.version = obj.version && obj.version.split(' ').map(item=>{
      return item.toUpperCase().replace('V','')
    })
    //处理媒体库的图片
    obj.photos = obj.photos.map(item => item.split('@')[0].replace('w.h/', '') +'@180w_140h_1e_1c')
    return obj
  }
})