var that
const app = getApp()
const MAX_LIMIT = 5;//每次显示5个数据
const db = wx.cloud.database({
  env: 'hainanu-3ozvd'
})
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '',//反馈的内容
    images: [],//反馈的图片
    isLike: [],//点赞数
    topics: {},//反馈的所有信息
    showModal: false,
    show: 0,
  },

  CancelModal: function () {//隐藏发布信息
    this.setData({
      showModal: false
    })
  },
  showCardView: function () {//显示发布信息
    this.setData({
      showModal: true
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    if (app.globalData.hid) {
      //获得数据库的反馈信息
      db.collection('tellus').count().then(res => {
        that.setData({
          totalCount: res.total,
          i: Math.ceil(res.total / MAX_LIMIT),
          show: 1
        })
        if (that.data.i < 2) {
          that.setData({
            totalCount: res.total,
            i: 2,
          })
        }
        db.collection('tellus').skip((that.data.i - 2) * MAX_LIMIT).get({
          success: function (res) {
            res.data.sort(that.compare("compare"));
            that.data.topics = res.data;
            that.setData({
              topics: that.data.topics,
            })
          }
        })
      })
    }
    else {
      wx.showToast({
        title: '暂无内容',
        icon: "none"
      })
    }
  },

  onShow: function () {

  },
  /**
   * 获取列表数据
   * 
   */
  getTextAreaContent: function (event) {//获得输入框数据
    var that = this
    that.data.content = event.detail.value;
  },

  cancel1: function (event) {//删除反馈
    var that = this
    var i = event.currentTarget.dataset.i;
    wx.showModal({
      title: '注意',
      content: '是否要删除？',
      success: function (res) {
        if (res.confirm) {
          console.log(i)
          db.collection('tellus').doc(i).remove({
            success: function () {
              wx.showToast({
                title: '删除成功！',
                icon: "none"
              })
            }
          })
          that.getData()
        }
        else {
          consoel.log("点击取消")
        }
      }
    })
  },
  formSubmit: function (e) {//上传表单
    var that = this
    this.setData({
      showModal: false
    })
    if (!app.globalData.hid) {
      wx.showToast({
        title: '请先登录！',
        icon: "none"
      })
    }
    else {
      //获得用户头像信息
      wx.getUserInfo({
        success: function (res) {
          that.data.user = res.userInfo;
          that.data.content = e.detail.value['input-content'];
            if (that.data.content.trim() != '') {
            that.saveDataToServer();
          } else {
            wx.showToast({
              icon: 'none',
              title: '写点东西吧',
            })
          }
        }
      })
    }
  },

  saveDataToServer: function (event) {//保存表单文件到数据库
    var that = this
    var date = app.dateFormat(new Date())
    db.collection('tellus').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        content: that.data.content,
        date: date,
        user: that.data.user,
        compare: that.data.totalCount
      },
      success: function (res) {
        // 保存到发布历史
        // that.saveToHistoryServer();
        // 清空数据
        that.data.content = "";
        that.data.images = [];
        that.getData();
        that.setData({
          textContent: '',
          images: [],
          like_num: that.data.like_num.concat(0)
        })
        wx.showToast({
          title: '发布成功！',
          icon: "none"
        })
        //that.showTipAndSwitchTab();
      },
      fail: function () {
        wx.showToast({
          title: '发布失败，请检查网络！',
          icon: "none"
        })
      }
    })
  },


  compare: function (property) {//比较
    return function (a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value2 - value1;
    }
  },


  getData: function () {//刷新数据
    var that = this
    wx.showLoading({
      title: '加载中',
    })
      db.collection('tellus').count().then(res => {
        that.setData({
          totalCount: res.total,
          i: Math.ceil(res.total / MAX_LIMIT)
        })
        if (that.data.i < 2) {
          that.setData({
            totalCount: res.total,
            i: 2
          })
        }
        db.collection('tellus').skip((that.data.i - 2) * MAX_LIMIT).get({
          success: function (res) {
            res.data.sort(that.compare("compare"));
            // res.data 是包含以上定义的两条记录的数组
            that.data.topics = res.data;
            that.setData({
              topics: that.data.topics,
            })
            wx.hideLoading()
          },
          fail: function (event) {
            wx.showToast({
              title: '加载失败，请检查网络',
              icon: "none"
            })
          }
        })
      })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.getData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    var temp = [];
    // 获取后面10条
    wx.showLoading({
      title: '加载中',
    })
      if (that.data.topics.length < that.data.totalCount) {
        db.collection('tellus').skip((that.data.i - 3) * MAX_LIMIT).limit(MAX_LIMIT).get({
          success: function (res) {
            console.log(res)
            res.data.sort(that.compare("compare"));
            if (res.data.length > 0) {
              for (var i = 0; i < res.data.length; i++) {
                var tempTopic = res.data[i];
                temp.push(tempTopic);
              }
              var totalTopic = {};
              totalTopic = that.data.topics.concat(temp);
              console.log(totalTopic);
              that.setData({
                i: that.data.i - 1,
                topics: totalTopic,
              })
              wx.hideLoading()
            } else {
              wx.showToast({
                title: '没有更多数据了',
                icon: 'none',
                duration: 1500
              })
            }
          },
        })
      }
      else {
        wx.showToast({
          title: '没有更多数据了',
          icon: 'none',
          duration: 1500
        })
      }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})