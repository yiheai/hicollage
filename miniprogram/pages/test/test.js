const app = getApp();
const sm2 = require('miniprogram-sm-crypto').sm2;
const publicKey = "04a312bb3d6b59e339319ce812b90c2622bf9399afa8feac44351b8de44e4710d6cdeaad9c70d95ba778bd7eed794cf01a84933d789af33e4e2dc9fdcf8da96f48";
Page({
  data: {
    test: [],
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
      for (var i in app.globalData.schools) {
        if (app.globalData.school == app.globalData.schools[i]) {
          var this_url = app.globalData.school_url[i]
        }
      }
      console.log(this_url + '/app.do?method=getKscx&xh=' + app.globalData.student_id)
      wx.cloud.callFunction({//从云函数中请求当前course
        name: 'course',
        data: {
          url: sm2.doEncrypt(this_url + '/app.do?method=getKscx&xh=' + app.globalData.student_id, publicKey, app.globalData.token),
          "token": app.globalData.token
        },
        success: res => {
          console.log(res)
          if (res.result.length != 0 && res.result.ksqssj != null) {
          that.setData({
            test:res.result
          })
            var this_time = []
            var this_test = that.data.test
            for(i=0;i<this_test.length;i++){
              this_time.push(that.data.test[i].ksqssj.split("-"))
              console.log(this_time[i])
              this_test[i].ksqssj = this_time[i][1]+'-'+this_time[i][2].split("~")[0]+'~'+this_time[i][4].split(" ")[1]
            }
            console.log(this_test)
            that.setData({
              test:this_test
            })
            wx.hideLoading()
          }else{
              wx.showToast({
                title: '暂无考试',
                icon: 'none'
              })
          }
        },
        fail:res=>{
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