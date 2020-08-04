const app = getApp();
const db = wx.cloud.database({//存入数据库
  env: 'hainanu-3ozvd'
})
Page({
  data: {
    remind: '加载中',
    angle: 0,
    student_id:'',
    avg_score:'',
    avatarUrl:"https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/loser.png?sign=0bbeccc67f891048e1b5ec6101c1e64d&t=1591085430",
    id:'',
    hid:0,
    school:"",
    schools_url: ["../assets/images/icons/hainanu_bg.jpg", "../assets/images/icons/xiangtanu_bg.jpg", "../assets/images/icons/nanchangu_bg.jpg", "../assets/images/icons/shandongu_bg.jpg","../assets/images/icons/dianziu_bg.jpg"],
    bg_url: ""
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: `HiCollege`
    })
    if (app.globalData.hid)
    {
   this.setData({
     school:app.globalData.school
   })
    for (var i = 0;i<app.globalData.schools.length;i++)
    {
      if (this.data.school == app.globalData.schools[i])
      {
        console.log(i)
        this.setData({
          bg_url: this.data.schools_url[i]
        })
      }
    }
    console.log(this.data.bg_url)
    this.setData({
      hid:app.globalData.hid //判断是否登录，1代表登录，0代表未登录
    })
    }
  },
  onReady() {
    setTimeout(() => {//初始化加载动画超时毫秒数
      this.setData({
        remind: ''
      });
    }, 1000);
  },
  onShow:function() {
    if(app.globalData.hid){
    this.setData({
      avatarUrl: app.globalData.avatarUrl,
      nickname:app.globalData.nickName,
    })
    }
  },


  login() {//用户第一次登录，转到login界面
    wx.reLaunch({
      url: '../login/login',
    })
  },
  exit() {//用户退出登录，删除数据库中的用户信息，转到login界面
    var that = this
    wx.showModal({
      title: '提示',
      content: '操作不可逆！，你的信息将被删除（包括自定义课表等信息）',
      success: function (res) {
        if (res.confirm) {
          const db = wx.cloud.database({
            env: 'hainanu-3ozvd'
          })
          db.collection('user').doc(app.globalData.id).remove({
            success: res => {
              console.log("删除成功")
              app.globalData.hid = 0
              wx.clearStorageSync()
              wx.reLaunch({
                url: '../login/login',
              })
            },
          })
        } else {
          console.log('用户点击取消')
        }
      }

    })
  },
  update_data: function (options) {//重新加载数据
    wx.showLoading({
      title: '更新中'
    })
    var that = this
    var this_url = ''
    for (var i in app.globalData.school_url) {
      if (app.globalData.school == app.globalData.schools[i]) {
        this_url = app.globalData.school_url[i]
        break
      }
    }
    console.log(this_url, app.globalData.id)
    app.getall(this_url).then(res => {
      db.collection('user').doc(app.globalData.id).update({//更新新的信息
        data: {
          course: app.globalData.course,
          score: app.globalData.scores,
          semester: app.globalData.semester,
          message: app.globalData.message,
          avg_score: app.globalData.avg_score,
        },
        success: res => {
          wx.clearStorage()
          wx.hideLoading()
          wx.showToast({
            title: '更新成功',
            icon: 'true',
            duration: 1500
          })
        },
        fail: err => {
          console.log(res)
          wx.showToast({
            icon: 'none',
            title: '请检查网络'
          })
        }
      })
    })
    that.setData({
      student_id: app.globalData.student_id,
      message: app.globalData.message,
      avg_score: app.globalData.avg_score,
      avatarUrl: app.globalData.avatarUrl,
    })
  },
});