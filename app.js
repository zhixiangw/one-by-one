const citys = [{ "id": 1, "nm": "上海", "py": "shanghai" }]
const QQMapWX = require('./assets/libs/qqmap-wx-jssdk.min.js');

let qqmapsdk;
qqmapsdk = new QQMapWX({
  key: 'MH2BZ-4WTK3-2D63K-YZRHP-HM537-HHBD3'
});

App({
  onLaunch: function () {
    this.initPage()
  },
  initPage(){
    wx.getSystemInfo({
      success: (res) => {
        const heightRpx = res.windowHeight / (res.windowWidth / 750);
        this.globalData.systemInfo.windowHeightRpx = Math.floor(heightRpx)
      },
    })
    const menuButton = wx.getMenuButtonBoundingClientRect()
    this.globalData.systemInfo.menuTop = menuButton.top

    // 获取用户授权信息信息,防止重复出现授权弹框
    wx.getSetting({
      success: res => {
        //已有权限直接获得信息，否则出现授权弹框
        if (res.authSetting['scope.userLocation']) {
          this.getUserLocation()
        } else {
          this.getUserLocation()
        }
      }
    })
  },
  //获取用户的位置信息
  getUserLocation() {
    wx.getLocation({
      //成功授权
      success: (res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        qqmapsdk.reverseGeocoder({
          location: {
            latitude,
            longitude
          },
          success: (res) => {
            // const cityFullname = res.result.address_component.city;
            // const nm = cityFullname.substring(0, cityFullname.length - 1)
            // const city = citys.find(v => v.nm.includes(nm)) || {}
            const cityInfo = {
              latitude,
              longitude,
              cityName: '上海',
              cityId: 1,
              status: 1
            }
            this.globalData.userLocation = { ...cityInfo}   //浅拷贝对象
            this.globalData.selectCity = { ...cityInfo } //浅拷贝对象
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回，所以此处加入 callback 以防止这种情况
            if (this.userLocationReadyCallback) {
              this.userLocationReadyCallback()
            }
          }
        })
      },
      fail:()=>{
        this.globalData.userLocation = {status:0}
        //防止当弹框出现后，用户长时间不选择，
        if (this.userLocationReadyCallback) {
          this.userLocationReadyCallback()
        }
      }
    })
  },
  globalData: {
    citys,
    userLocation: null, //用户的位置信息
    selectCity: null, //用户切换的城市
    systemInfo: {
      windowHeightRpx: 0,
      menuTop: 0
    }
  }
})