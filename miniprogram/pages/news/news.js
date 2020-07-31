var that
const app = getApp()
const db = wx.cloud.database({
  env: 'hainanu-3ozvd'
}) 
const MAX_LIMIT = 5;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    news: {},
    i: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
    db.collection('news').count().then(res => {
      this.setData({
        totalCount: res.total,
      })
    })
  },

  onShow: function () {

  },
  /**
   * 获取列表数据
   * 
   */
  compare: function (property) {//比较
    return function (a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value2 - value1;
    }
  },
  getData: function () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
            db.collection('news').skip((that.data.i) * MAX_LIMIT).limit(MAX_LIMIT).get({
              success: function (res) {
                res.data.sort(that.compare("compare"));
                //console.log(res.data)
                that.data.news = res.data;
                for(var i in res.data)
                {
                  for(var j in res.data[i].images)
                  {
                    if (that.data.news[i].images[j].indexOf("//f")!=-1)
                    {
                      that.data.news[i].images[j] = "https:" + that.data.news[i].images[j] +"?x-oss-process=image/resize,m_fill,h_70,w_95"
                      console.log(that.data.news[i].images[j])
                    }
                    
                  }
                }
                that.setData({
                  news: that.data.news,
                })
                console.log(that.data.news)
                wx.hideLoading()
              },
              fail: function (event) {
                wx.showToast({
                  title: '加载失败，请检查网络',
                  icon: "none"
                })
              }
            })
  },
  /**
   * item 点击
   */
  onItemClick: function (event) {
    var id = event.currentTarget.dataset.id;
    var openid = app.globalData.openid;
    //console.log(id);
   // console.log(openid);
    wx.navigateTo({
      url: "../newsdetail/newsdetail?id=" + id + "&openid=" + openid
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
    if (this.data.news.length < this.data.totalCount) {
      db.collection('news').skip((that.data.i+1) * MAX_LIMIT).limit(MAX_LIMIT).get({
        success: function (res) {
          //console.log(res)
          res.data.sort(that.compare("compare"));
          if (res.data.length > 0) {
            var this_news = res.data;
            for (var i in res.data) {
              for (var j in res.data[i].images) {
                if (this_news[i].images[j].indexOf("//f") != -1) {
                  this_news[i].images[j] = "https:" + this_news[i].images[j] + "?x-oss-process=image/resize,m_fill,h_70,w_95"
                  console.log(this_news[i].images[j])
                }
              }
            }
            that.setData({
              news: that.data.news.concat(this_news),
            })
            console.log(that.data.news)
            var totalNews = {};
            totalNews = that.data.news.concat(temp);
            //console.log(totalNews);
            that.setData({
              i: that.data.i + 1,
              news: totalNews,
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