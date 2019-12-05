Page({
  bindgetphonenumber(res){
    console.log(res)
  },
  bindgetuserinfo(res){
    console.log(res)
  },
  onShareAppMessage(res){
    return {
      title:'一起看电影',
      path:'pages/tabBar/movie/movie'
    }
  }
})