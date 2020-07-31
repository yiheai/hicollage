var that
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    news: {},
    id: '',
    openid: '',
    isLike: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    that = this;
    that.data.id = options.id;
    that.data.openid = options.openid;
    db.collection('news').doc(that.data.id).get({
      success: function (res) {
        console.log(res.data)
        db.collection('news').doc(res.data._id).update({
          data:{
            content: res.data.content.replace(/pt/g, "rpx")
            //content:res.data.content.repalce(/<img/g,'<img class="content-img" mode="widthFix" bindtap="previewImg" data-index="{{idx}}"background-color: #999"')
          },
        })
        that.news = res.data;
        that.setData({
          news: that.news,
        })
        wx.hideLoading()
      }
    })
  },

  onShow: function () {
    // 获取回复列表
    that.getReplay()
  },

  getReplay: function () {
    // 获取回复列表
  },
  /**
   * 刷新点赞icon
   */
  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      //当前显示图片
      current: this.data.news.images[index],
      //所有图片
      urls: this.data.news.images
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})