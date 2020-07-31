const app = getApp();
const sm2 = require('miniprogram-sm-crypto').sm2;
const publicKey = "04a312bb3d6b59e339319ce812b90c2622bf9399afa8feac44351b8de44e4710d6cdeaad9c70d95ba778bd7eed794cf01a84933d789af33e4e2dc9fdcf8da96f48";
Page({
  data: {
   multiIndex: [0,0,0],//多picker型索引值
    classroom: [],//空教室数组
    time: [["第1节", "第2节", "第3节", "第4节", "第5节", "第6节", "第7节", "第8节", "第9节", "第10节", "第11节"], ["第2节", "第3节", "第4节", "第5节", "第6节", "第7节", "第8节", "第9节", "第10节", "第11节"], ["1号教学楼", "2号教学楼", "3号教学楼", "4号教学楼", "5号教学楼", "6号教学楼", "7号教学楼", "8号教学楼", "9号教学楼", "10号教学楼","所有教学楼"]],//picker值，教室-起始课时-结束课时
    kc:['01','02','03','04','05','06','07','08','09','10','11']//对应url请求课时
  },
  onLoad: function (options) {
    if (app.globalData.hid) {
    wx.showLoading({
      title: '加载中'
    })
    wx.setNavigationBarTitle({
      title: `HiCollege`
    })

    this.get_classroom("")
    this.setData({
      multiIndex: [0, 0, 10]
    })
    }
  },

get_classroom(data){
  var that = this;
  var time = [];
  var classroom = []//空教室数组
  var room = {}//排序中间变量
  wx.cloud.callFunction({//请求空教室数据
    name: 'score',
    data: {
       url: sm2.doEncrypt("http://jxgl.hainu.edu.cn/app.do?method=getKxJscx&time=&idleTime=" + data + "allday&xqid=3", publicKey, app.globalData.token),
      "token": app.globalData.token
    },
    success: res => {
      if (res.result != "失败") {
        for (let i = 0; i < res.result.length; i++)//对返回数据进行处理
        {
          if (res.result[i]['jxl'].indexOf("教学楼") >= 0) {
            classroom.push(res.result[i])
          }
        }
        for (let i = 0; i < classroom.length - 1; i++)//对教学楼进行排序
        {
          for (let j = i + 1; j < classroom.length; j++) {
            if (parseInt(classroom[i]['jxl'].match(/\d/g).join('')) > parseInt(classroom[j]['jxl'].match(/\d/g).join(''))) {//冒泡法排序
              room = classroom[i]
              classroom[i] = classroom[j]
              classroom[j] = room
            }
          }
        }
        for (let i = 0; i < classroom.length; i++) {//对教学楼名字进行处理
          classroom[i]['jxl'] = classroom[i]['jxl'].substring(7)
        }
        if (that.data.multiIndex[2] != that.data.time[2].length - 1) {//如果不是选择所有教学楼
          for (var i = 0; i < classroom.length; i++) {
            if (classroom[i]['jxl'] == (that.data.time[2][that.data.multiIndex[2]])) {
              that.setData({
                classroom: [classroom[i]],
              })
              break
            }
          }
          if (i == classroom.length) {
            console.log("不存在空教室")
            that.setData({
              classroom: [{ 'jxl': that.data.time[2][that.data.multiIndex[2]]}],
            })
          }
        }
        else {//选择所有教学楼
          that.setData({
            classroom: classroom
          })
        }
      }
      wx.hideLoading()
    }
  })
},

  onReady() {
  }, 


  bindMultiPickerColumnChange: function (e) { //筛选框
    var that = this;
    var ks =[];
    var classroom = []
    var room = {}
    var rand = []
    that.setData({
      ["multiIndex[" + e.detail.column + "]"]: e.detail.value,
    })
    for(let i=that.data.multiIndex[0];i<10;i++)
    {
      ks.push(that.data.time[0][i+1])
    }
    that.setData({
      ["time[" + 1 + "]"]: ks
    })
  },


bindChange1:function(){//筛选
  wx.showLoading({
    title: '加载中'
  })
  var that =this
  that.get_classroom(that.data.kc[that.data.multiIndex[0]] + that.data.kc[that.data.multiIndex[0] + that.data.multiIndex[1] + 1])
},


  onShow: function () {
    if (!app.globalData.hid) {
      wx.showToast({
        title: '暂无教室',
        icon: 'none',
        duration: 1500
      })
    }
  },
});