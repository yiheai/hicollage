const app = getApp();
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
      nickname:app.globalData.nickName
    })
    }
  },


  login() {//用户第一次登录，转到login界面
    wx.reLaunch({
      url: '../login/login',
    })
  },
});