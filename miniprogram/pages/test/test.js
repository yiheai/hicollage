const app = getApp();
const sm2 = require('miniprogram-sm-crypto').sm2;
const publicKey = "04a312bb3d6b59e339319ce812b90c2622bf9399afa8feac44351b8de44e4710d6cdeaad9c70d95ba778bd7eed794cf01a84933d789af33e4e2dc9fdcf8da96f48";//公钥用于加密
Page({
  data: {
    test: [],//考场信息
  },
  onLoad: function (options) {
    var that =this
    if (app.globalData.hid) {
      wx.showLoading({
        title: '加载中'
      })
      wx.setNavigationBarTitle({
        title: `HiCollege`
      })
      //找到学校的url
      for (var i in app.globalData.schools) {
        if (app.globalData.school == app.globalData.schools[i]) {
          var this_url = app.globalData.school_url[i]
        }
      }
      //不要在意为什么是course，因为course是万能的
      wx.cloud.callFunction({
        name: 'course',
        data: {
          url: sm2.doEncrypt(this_url + '/app.do?method=getKscx&xh=' + app.globalData.student_id, publicKey, app.globalData.token),
          "token": app.globalData.token
        },
        success: res => {
          //如果返回不为空
          if (res.result.length != 0 && res.result.ksqssj != null) {
            var this_time = []
            var this_test = res.result
            //整理一下时间的参数，返回的时间格式太长了~
            for(i=0;i<this_test.length;i++){
              this_time.push(that.data.test[i].ksqssj.split("-"))
              console.log(this_time[i])
              this_test[i].ksqssj = this_time[i][1]+'-'+this_time[i][2].split("~")[0]+'~'+this_time[i][4].split(" ")[1]
            }
            that.setData({
              test:this_test
            })
            wx.hideLoading()
          }
          //返回为空
          else{
              wx.showToast({
                title: '暂无考试',
                icon: 'none'
              })
          }
        }
      })
    }
  },

  onReady() {
  },


  onShow: function () {
    if (!app.globalData.hid) {
      wx.showToast({
        title: '暂无数据',
        icon: 'none',
        duration: 1500
      })
    }
  },
});