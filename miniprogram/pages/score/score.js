var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  showModal: false,
  data: {
    multiArray1: [],//学期picker值
    multiIndex1: [],//学期picker索引值
    xf_course: ["公共基础课", "学科基础课", "实践教学环节", "人文通识经典课", "专业选修课", "专业必修课", "专业课"],//显示需要计算学分的科目
    this_semester:'所有学期'//当前显示学期
  },

  showCardView: function (event) {//获取点击获取详情的值
    var that = this
    that.setData({
      showModal: true,
      kcmc: that.data.score[event.currentTarget.dataset.index]['kcmc'],
      kclbmc: that.data.score[event.currentTarget.dataset.index]['kclbmc'],
      kcxzmc: that.data.score[event.currentTarget.dataset.index]['kcxzmc'],
      ksxzmc: that.data.score[event.currentTarget.dataset.index]['ksxzmc'],
      xf: that.data.score[event.currentTarget.dataset.index]['xf'],
      wid: that.data.score[event.currentTarget.dataset.index]['kcmc'].length
    })
  },


  CancelModal: function () {//遮罩层的显示控制
    this.setData({
      showModal: false
    })
  },


  pickerTap1: function () {//定义学期picker
  },


  bindChange1: function (e) {//改变学期picker索引值时触发
    wx.showLoading({
      title: '加载中'
    })
    var that = this
    var sum = 0
    var xf_s = 0
    var xf_course = that.data.xf_course
    var avg_score = 0
    that.setData({
      score: [],
    })
    var score = []
    that.setData({
      multiIndex1: e.detail.value,//学期索引值
      this_semester: that.data.multiArray1[e.detail.value]
    })
    if (that.data.multiArray1[e.detail.value] == '所有学期') {//获取所有学期的score
      score = app.globalData.scores
    }
    else{
      for(var i = 0;i<app.globalData.scores.length;i++) // 获取选择学期的所有score
    {
      if (app.globalData.scores[i].xqmc == that.data.multiArray1[e.detail.value])
      {
        score.push(app.globalData.scores[i])
      }
    }
    }

    that.setData({
      score: score
    })

    for (var i = 0; i < that.data.score.length; i++) { //计算平均绩点
      for (var j = 0; j < xf_course.length; j++) {
        if (that.data.score[i].kcxzmc == xf_course[j]) {
        //        .log(that.data.score[i].kcmc)
          if ((parseFloat(that.data.score[i].zcj) - 60) / 10 + 1 > 4) {
            sum = sum + 4 * that.data.score[i].xf
          }
          else {
            sum = ((parseFloat(that.data.score[i].zcj) - 60) / 10 + 1) * that.data.score[i].xf + sum
          }
          xf_s = xf_s + parseFloat(that.data.score[i].xf)
        }
      }
    }
    avg_score = (sum / xf_s).toFixed(2)
    that.setData({
      avg_score: avg_score
    })
    wx.hideLoading()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.hid) {
      wx.showLoading({
        title: '加载中'
      })
      var that = this
      var sum = 0
      var xf_s = 0
      var xf_course = that.data.xf_course
      var avg_score = 0
      //学期
      var xq = []
          xq = app.globalData.semester //获得semester并在最后加上“所有学期”
          xq=xq.concat("所有学期")
          that.setData({
            multiArray1: xq,
            multiIndex1: xq.length - 1,
            score: app.globalData.scores,
            avg_score: app.globalData.avg_score
          })
          wx.hideLoading()
        }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!app.globalData.hid) {
      wx.showToast({
        title: '暂无成绩',
        icon: 'none',
        duration: 1500
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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

  },

})
