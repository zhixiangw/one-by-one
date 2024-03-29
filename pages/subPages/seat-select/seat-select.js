const Api = require('../../../utils/request.js')
Page({
  data: {
    cinemaName: '',
    title: '',
    hallName: '',
    height: "",
    seat: [],
    seats: [],
    xyArray: [],
    imgSrc: "/assets/icon/seatPre.png",
    lineTop: 0,
    lineHeight: "",
    lineArray: [],
    columnNumber: 0,
    selectX: 0,
    selectY: 0,
    selectSeatList: [],
    totalMoney: "",
    totalMoneyFloat: 0.00,
    movie: [],
    price: 0,
    scaleValue: 1, // 默认缩放倍数
    orderInfo: {},
    lockInfo: {}, // 锁定信息
    cinemaId: "",
    movieId: "",
    day: "",
    showId: "",
    cinemaName: ""
  },

  /**
   * seqNo=1068254677&cinemaId=8091&movieId=1428928&day=2022-10-16
   * 生命周期函数--监听页面加载 
   */
  onLoad: function ({ seqNo: showId, cinemaId, movieId, day,cinemaName }) {
    wx.showLoading({
      title: '正在加载...',
    })

    // 先前锁定的座位数据
    const values = wx.getStorageSync('order_confirm') || "{}"
    const { lockInfo = {} } = JSON.parse(values)

    this.setData({ showId, cinemaId, movieId, day, cinemaName, lockInfo }, this.init)
  },
  // seqNo=1067997357&cinemaId=14101&movieId=1436719&day=2022-10-17
  // seqNo=1067997354&cinemaId=14101&movieId=1428928&day=2022-10-18
  init: function () {
    const { showId }  = this.data
    Api.request({
      url: '/seatList',
      method: 'get',
      data: {
        showId
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data.seatError) {
          wx.showToast({
            title: res.data.seatError.message,
            duration: 2000,
            icon: 'none'
          })
          if (res.data.seatError.code === 10051) {
            //场次信息不存在
            let pages = getCurrentPages(); //页面栈
            let beforePage = pages[pages.length - 2];
            const onloadData = {
              cinemaId: this.data.cinemaId,
              movieId: this.data.movieId,
              day: this.data.day
            }
            setTimeout(()=>{
               wx.navigateBack({
                delta: 1, //返回的页面数，如果 delta 大于现有页面数，则返回到首页。
                success: function () {
                  if (beforePage.route == 'pages/subPages/cinema-detail/cinema-detail') {
                    beforePage.onLoad(onloadData) //这个函数式调用接口的函数
                  }
                }
              })
            }, 2000)

          }
        } else {
          const { show, film, seatList } = res.data
          this.setData({
            orderInfo: {
              cinemaId: this.data.cinemaId,
              movieId: this.data.movieId,
            },
            cinemaName: this.data.cinemaName,
            cinemaId: this.data.cinemaId,
            hallName: show.hallName,
            movieName: film.nm,
            lang: `${show.lang}${show.versionType}`,
            time: `${show.showDate} ${show.showTime}`,
            title: `${show.showDate} ${show.showTime} ${show.lang}${show.versionType}`,
            price: show.netPrice,
            seats: seatList
          }, this.drawSeats)
          wx.setNavigationBarTitle({ title: film.nm })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  drawSeats: function() {
    let xyArray = [];
    let xArray = [];
    let yArray = [];
    for (let a = 0; a < this.data.seats.length; a++) {
      if (yArray.indexOf(this.data.seats[a].yCoord) == -1) {
        yArray.push(this.data.seats[a].yCoord);
      }
    }
    let totalArray = [];
    let maxLen = 0
    for (let b = 0; b < yArray.length; b++) {
      let xxA = [];
      for (let c = 0; c < this.data.seats.length; c++) {
        if (yArray[b] == this.data.seats[c].yCoord) {
          if (this.data.seats[c].type == "danren") {
            if (this.data.seats[c].status == "ok") {
              this.data.seats[c].iconSrc = "/assets/icon/seatPre.png";
            } else if (this.data.seats[c].status == "disabled") {
              this.data.seats[c].iconSrc = "/assets/icon/seatDisabled.png";
            } else {
              this.data.seats[c].iconSrc = "/assets/icon/seatDone.png";
            }
          } else if (this.data.seats[c].type == "road") {
            this.data.seats[c].iconSrc = "";
          }
          this.data.seats[c].select = false;
          xxA.push(this.data.seats[c]);
        }
      }
      maxLen = Math.max(xxA.length, maxLen)
      totalArray.push(xxA);
    }
    let scaleValue = 1
    if (maxLen >= 25 && maxLen < 36) {
      scaleValue = 0.7
    } else if (maxLen >= 36) {
      scaleValue = 0.5
    }
    this.setData({
      seat: totalArray,
      lineArray: yArray,
      columnNumber: yArray.length,
      scaleValue
    })

    const query = wx.createSelectorQuery()
    query.select('#seatView').boundingClientRect()
    query.exec((res) => {
      let height = res[0].height;
      let newHeight = height / yArray.length;
      let top = res[0].top;
      this.setData({
        lineHeight: newHeight,
        lineTop: top
      })
    })
  },
  formatSeatRow(rows) {
    let seats = []
    rows.forEach(function(row){
      seats = seats.concat(row.seats.map((seat, index) => ({
        cineSeatId: seat.seatNo,
        xCoord: seat.columnId,
        yCoord: seat.rowId,
        row: row.rowNum,
        column: index - 1,
        status: seat.seatStatus === 1 ? 'ok' : (seat.seatStatus === 4 ? 'disabled' : 'booked') ,
        type: seat.seatType === 'N' ? 'danren' : 'road',
      })))
    })
    return seats
  },
  onChange(e) {
    const query = wx.createSelectorQuery()
    query.select('#seatView').boundingClientRect()
    query.exec((res) => {
      let height = res[0].height;
      let top = res[0].top;
      let newHeight = height / this.data.columnNumber;
      this.setData({
        lineHeight: newHeight,
        lineTop: top
      })
    })
  },
  onScale(e) {
    const query = wx.createSelectorQuery()
    query.select('#seatView').boundingClientRect()
    query.exec((res) => {
      let height = res[0].height;
      let top = res[0].top;
      let newHeight = height / this.data.columnNumber;
      this.setData({
        lineHeight: newHeight,
        lineTop: top
      })
    })
  },
  selectSeat(e) {
    let x = e.currentTarget.dataset.ix;
    let y = e.currentTarget.dataset.index;
    this.setData({
      selectX: x,
      selectY: y
    })
    let totalArray = this.data.seat;
    for (var a = 0; a < totalArray.length; a++) {
      for (var b = 0; b < totalArray[a].length; b++) {
        let item = totalArray[a][b];
        if (item.yCoord == y && item.xCoord == x &&
          item.status == 'ok' && item.type != 'road') {
          let totalMoney = 0.00;
          let totalMoneyStr = "";
          if (item.select == true) {
            item.select = false;
            item.iconSrc = "/assets/icon/seatPre.png";
            let seatInfo = item.yCoord + "排" + item.xCoord + "座";
            this.remove(seatInfo);
            totalMoney = parseFloat(this.data.totalMoneyFloat) - parseFloat(this.data.price);
            totalMoney = totalMoney.toFixed(2)
            totalMoneyStr = totalMoney.toString();
            if (totalMoney == 0) {
              totalMoneyStr = "";
            }
          } else {
            if (this.data.selectSeatList.length == 5) {
              wx.showToast({
                title: '最多选择5个座位',
                icon: 'none',
                duration: 1000,
                mask: true
              })
              return ;
            } else {
              item.select = true;
              item.iconSrc = "/assets/icon/selectIcon.png";
              let seat = {};
              let seatInfo = item.yCoord + "排" + item.xCoord + "座";
              seat.seatInfo = seatInfo;
              seat.x = item.xCoord;
              seat.y = item.yCoord;
              seat.index = item.xCoord + item.yCoord;
              seat.cineSeatId = item.cineSeatId
              this.data.selectSeatList.push(seat);
              totalMoney = parseFloat(this.data.totalMoneyFloat) + parseFloat(this.data.price);
              totalMoney = totalMoney.toFixed(2)
              totalMoneyStr = totalMoney.toString();
            }
          }
          this.setData({
            selectSeatList: this.data.selectSeatList,
            totalMoney: totalMoneyStr,
            totalMoneyFloat: totalMoney
          })
        }
      }
    }
    this.setData({
      seat: totalArray
    })
  },
  remove(val) {
    for (var a = 0; a < this.data.selectSeatList.length; a++) {
      if (this.data.selectSeatList[a].seatInfo == val) {
        this.data.selectSeatList.splice(a, 1);
        break;
      }
    }
    this.setData({
      selectSeatList: this.data.selectSeatList
    })
  },
  cancelSeat(e) {
    let index = e.currentTarget.dataset.index;
    let x = e.currentTarget.dataset.x;
    let y = e.currentTarget.dataset.y;
    let totalArray = this.data.seat;
    for (var a = 0; a < totalArray.length; a++) {
      for (var b = 0; b < totalArray[a].length; b++) {
        if (totalArray[a][b].xCoord == x && totalArray[a][b].yCoord == y) {
          totalArray[a][b].select = false;
          totalArray[a][b].iconSrc = "/assets/icon/seatPre.png";
          break;
        }
      }
    }
    for (var c = 0; c < this.data.selectSeatList.length; c++) {
      if (this.data.selectSeatList[c].index == index) {
        this.data.selectSeatList.splice(c, 1);
        break;
      }
    }
    let totalMoney = this.data.totalMoneyFloat - parseFloat(this.data.price);
    let totalMoneyStr = totalMoney.toString();
    if (totalMoney == 0) {
      totalMoneyStr = "";
    }
    this.setData({
      seat: totalArray,
      selectSeatList: this.data.selectSeatList,
      totalMoney: totalMoneyStr,
      totalMoneyFloat: totalMoney
    })
  },
  submit() {
    const { selectSeatList, showId, lockInfo } = this.data
    const orderSeats = {
      count: selectSeatList.length,
      list: selectSeatList.map(v => ({ seatNo: v.cineSeatId, seatName: v.seatInfo, row: v.y, column: v.x }))
    }

    wx.showLoading({
      title: '正在锁定座位...',
    })

    Api.request({
      url: '/orderConfirm',
      method: 'POST',
      data: {
        showId,
        lockInfo,
        seats: JSON.stringify(orderSeats)
      },
      success: (res) => {
        wx.hideLoading()
        const {
          hall,
          show_time,
          seats = [],
          movie_img = '',
          movie_name = '',
          ver = '',
          lang = '',
          cinema_name = '',
          phone,
          show_amount,
          vip_amount,
          voucher_amount,
          movies_vouchers = [],
          snacks_vouchers = [],
          vipCard = [],
          lockInfo = {},
        } = res.data

        this.setData({
          lockInfo
        })

        const orderInfo = encodeURIComponent(JSON.stringify({
          showId,
          orderSeats,
          movieImg: movie_img.replace('w.h', ''),
          movieName: movie_name,
          time: show_time,
          lang: `${lang}${ver}`,
          cinemaName: cinema_name,
          hall,
          phone,
          show_amount,
          vip_amount,
          voucher_amount,
          seat: seats.join(' ')
        }))
        wx.setStorageSync('order_confirm', JSON.stringify({ movies_vouchers, snacks_vouchers, vipCard, lockInfo }))
        wx.navigateTo({
          url: `/pages/subPages/buy-ticket/buy-ticket?orderInfo=${orderInfo}`,
        })
      }
    })
  }

})