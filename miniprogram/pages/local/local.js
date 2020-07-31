// pages/local/local.js
const app = getApp()
const db = wx.cloud.database({//存入数据库
  env: 'hainanu-3ozvd'
})
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classes:[],
    modalhidden:true,
    non_register:[],//未签到
    register:[],//已签到
    id:"",
    showmask:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 设置加载超时时间
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that=this
    that.setData({
      register: [],//初始化
      non_register: []//初始化
    })
    db.collection('classroom').where({name:app.globalData.message.bj}).get({
      success:function(res){
        for(var i=0;i<res.data[0].students.length;i++)
        {
          if(res.data[0].students[i].local == true)//获得数据库已签到同学列表
          {
            that.setData({
              id:res.data[0]._id,
              register: that.data.register.concat(res.data[0].students[i])
            })
            //console.log(that.data.register)
          }
          else{//获取未签到同学列表
            that.setData({
              non_register: that.data.non_register.concat(res.data[0].students[i])
            })
            //console.log(that.data.non_register)
          }
        }
      }
    })
  },
  abandon:function(){
    var that = this
    db.collection("classroom").doc(that.data.id).update({
      data:{
        manager:""
      }
    })
    wx.navigateBack({
      
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  CancelModal:function(){
    var that =this
    that.setData({
      modalhidden: true,
      showmask: false
    })
  },
  showCardView:function(){//显示签到任务框
    var that = this
    that.setData({
      modalhidden: false,
      showmask:true
    })
  },

  talkInput1: function (e) {//输入签到时间间隔
    var that = this;
    that.setData({
      talk1: e.detail.value
    });
  },

  talkInput2: function (e) {//输入签到范围
    var that = this;
    that.setData({
      talk2: e.detail.value
    });
  },

  modalchange: function (e) {//悬浮框信息收集
    var date = new Date()
    var that = this
    var students = []
    var time = that.data.talk1//签到时长
    var range = that.data.talk2//签到范围
    that.setData({//隐藏信息框
      modalhidden: true,
      showmask:false
    })
    wx.getLocation({//获取当前位置
      type: 'wgs84',
      success: function (res) {
        const latitude = res.latitude
        const longitude = res.longitude
        db.collection('classroom').where({name:app.globalData.message.bj}).get({//将所有学生的local字段置为false
          success:function(res){
            students = res.data[0].students
            for (var i in students) {
              students[i].local = false
            }

          db.collection('classroom').doc(res.data[0]._id).update({//将任务存进数据据库
            data: {
              students: students,
              assignment: {//任务
                location: {//位置信息
                  lat: latitude,
                  lng: longitude,
                  range: range
                },
                during: {//时间信息
                  time:date,
                  during: parseInt(time)
                },
              }
            },
            success:function(res){
              wx.showToast({
                title: '新建成功',
                icon:"none"
              })
            }, 
            fail: function (res){
              wx.showToast({
                title: '新建失败，请检查网络',
                icon:"none"
              })
            }
          })
          }
        })
      }
    })
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})