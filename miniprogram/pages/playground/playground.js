var that
const app = getApp()
const MAX_LIMIT = 5;
const sm2 = require('miniprogram-sm-crypto').sm2;
const publicKey = "04a312bb3d6b59e339319ce812b90c2622bf9399afa8feac44351b8de44e4710d6cdeaad9c70d95ba778bd7eed794cf01a84933d789af33e4e2dc9fdcf8da96f48";
const db = wx.cloud.database({
  env: 'hainanu-3ozvd'
})
Page({
  /**
   * 页面的初始数据
   */
  data: {
    content: '',
    images: [],
    user: {},
    isLike:[],
    totalCount: 0,
    topics: {},
    modalhidden: true,
    showModal: false,
    showInput:false,
    talk:'',
    talk_page:[],
    id:'',
    talklist:[],
    focus:false,
    good:[],
    like_num:[],
    show_register: "",
    showcancel:[],
    i:1,
    j: 1,
    show:0,
    show_image:0,
    this_type_id:null,
    type_list: ['学校周边', '失物招领','二手买卖'],
    types:"",
    type_total:null,
    maxnum:0,
    news: {},
    k:0
  },

  CancelModal: function () {//隐藏发布广场
    this.setData({
      showModal: false
    })
  },
  showCardView: function () {//显示发布广场
    this.setData({
      showModal: true
    })
  },

 cancel1:function(event){//删除广场
   var that =this
   var i = event.currentTarget.dataset.i;
   wx.showModal({
     title: '注意',
     content: '是否要删除？',
   success:function(res){
     if(res.confirm)
     {
       console.log(i)
       db.collection('topic').doc(i).remove({
         success: function () {
           wx.showToast({
             title: '删除成功！',
             icon: "none"
           })
         }
       })
       that.getData()
     }
     else{
       consoel.log("点击取消")
     }
   }
   })
 },
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    var that = this
    db.collection('control').get({
      success:function(res){
        var control = res.data[0].topic
        that.setData({
          control:control
        })
        console.log(control)
    if(control){
    if (app.globalData.hid) {
      wx.showLoading({
        title: '加载中',
      })
      db.collection('topic').count().then(res => {
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
        db.collection('topic').skip((that.data.i - 2) * MAX_LIMIT).get({
          success: function (res) {
            res.data.sort(that.compare("compare"));
            that.setData({
              topics: res.data,
            })
            var maxnum = 0
            for(var i in res.data)
            {
              console.log(res.data[i].compare)
              if(res.data[i].compare > maxnum)
              {
                maxnum = res.data[i].compare
              }
            }
            that.setData({
              maxnum:maxnum+1,
            })
            db.collection('user').where({_openid:app.globalData.openid}).get({
              success: function (res) {
                for (var i = 0; i < that.data.topics.length; i++) {
                  if (res.data[0].good.indexOf(that.data.topics[i]._id)!=-1)
                  {
                    that.setData({
                      ["isLike[" + i + "]"]: 1,
                    })
                  }
                  else{
                    that.setData({
                      ["isLike[" + i + "]"]: 0,
                    })
                  }
                }
                that.setData({
                  user:res.data[0]
                })
                }
              })
            for (var i = 0; i < that.data.topics.length; i++) {
              that.setData({
                ["talk_page[" + i + "]"]: 0,
                ["like_num[" + i + "]"]: that.data.topics[i].like,
              })
              if (res.data[i]._openid == app.globalData.openid) {
                that.setData({
                  ["showcancel[" + i + "]"]: true
                })
              }
              else {
                that.setData({
                  ["showcancel[" + i + "]"]: false
                })
              }
            }
            console.log(that.data.showcancel)
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
    }else{
      wx.showToast({
        title: '暂无数据',
        icon: "none"
      })
    }
    }else{
      that.getD();
      db.collection('news').count().then(res => {
        that.setData({
          totalCount: res.total,
        })
      })
    }
      }
    })
  },


  imgYu: function (event) {//预览图片
    var src = event.currentTarget.dataset.src;//获取data-src
      var imgList = event.currentTarget.dataset.list;//获取data-list
     //图片预览
      wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: imgList // 需要预览的图片http链接列表
    })
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

  chooseImage: function (event) {//选择上传图片
    var that = this
    wx.chooseImage({
      count: 9,
      success: function (res) {
        // 设置图片
        that.setData({
          show_image:1,
          images: res.tempFilePaths,
        })
        that.data.images = []
        console.log(res.tempFilePaths)
        for (var i in res.tempFilePaths) {
          // 将图片上传至云存储空间
          wx.cloud.uploadFile({
            // 指定要上传的文件的小程序临时文件路径
            cloudPath: that.timetostr(new Date()),
            filePath: res.tempFilePaths[i],
            // 成功回调
            success: res => {
              that.data.images.push(res.fileID)
            },
          })
        }
      },
    })
  },

  timetostr(time) {//设定图片名称
    var randnum = Math.floor(Math.random() * (9999 - 1000)) + 1000;
    var str = randnum + "_" + time.getMilliseconds() + ".png";
    return str;
  },

  formSubmit: function (e) {//上传表单
    var that = this
    this.setData({
      showModal:false
    })
    if(!app.globalData.hid){
      wx.showToast({
        title: '请先登录！',
        icon:"none"
      })
    }
    else{
        that.data.content = e.detail.value['input-content'];
        if (that.data.images.length > 0) {
          that.saveDataToServer();
        } else if (that.data.content.trim() != '') {
          that.saveDataToServer();
      } else {
        wx.showToast({
          icon: 'none',
          title: '写点东西吧',
        })
      }
    }
  },

  saveDataToServer: function (event) {//保存表单文件到数据库
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    var date = app.dateFormat(new Date())
    db.collection('topic').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        content: that.data.content,
        date: date,
        images: that.data.images,
        user: that.data.user,
        talk:[],
        type:that.data.type_list[that.data.this_type_id],
        like:0,
        compare: that.data.maxnum
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
          this_type_id:null,
          maxnum:that.data.maxnum+1,
          like_num:that.data.like_num.concat(0)
        })
        wx.hideLoading()
        wx.showToast({
          title: '发布成功！',
          icon:"none"
        })
        //that.showTipAndSwitchTab();
      },
      fail:function(){
        wx.showToast({
          title: '发布失败，请检查网络！',
          icon: "none"
        })
      }
    })
  },

  speak: function (event){//评论按钮
    this.setData({
        focus:true,
        id: event.currentTarget.dataset.id,
      showInput: true
    })
  },

  selected:function(event){
    var that = this
    var i = event.currentTarget.dataset.id
    console.log(i)
    if (that.data.this_type_id == i) {
      that.setData({
        this_type_id: null
      })
    }else{
      that.setData({
        this_type_id: i
      })
    }
  },
  select: function(event){
      wx.showLoading({
        title: '加载中',
      })
    var type = event.currentTarget.dataset.type
    var that = this
    var type_total = 0
    if (type == that.data.types){
      that.setData({
        types:""
      })
      that.getData()
    }else{
      that.setData({
        types:type
      })
      if (app.globalData.hid) {
      db.collection('topic').where({ type:type }).count().then(res => {       that.setData({
        type_total : res.total,
        j : Math.ceil(res.total / MAX_LIMIT)
      })
      if(that.data.j<2)
      {
        that.setData({
          j: 2
        })
      }
      db.collection("topic").where({ type: type }).skip((that.data.j - 2) * MAX_LIMIT).get({
      success:function(res){
        res.data.sort(that.compare("compare"));
        if (res.data.length == 0) {
          wx.showToast({
            title: '暂无数据',
            icon: "none"
          })
        }
      that.setData({
        topics:res.data,
      })
      wx.hideLoading()        
      },
      fail:function(err){
        console.log(err)
      }
    })
      })
      } else {
        wx.showToast({
          title: '暂无消息',
          icon: 'none'
        })
      }
    }
  },
  good: function (event) {//点赞功能
    var n = 1
    var that = this
    var i = event.currentTarget.dataset.i
    var id = event.currentTarget.dataset.id
    that.setData({
      ["isLike[" + i + "]"]: !that.data.isLike[i],
    })
    if (that.data.isLike[i] != true) {
       n = -1
    }
    that.setData({
      ["like_num[" + i + "]"]: that.data.topics[i].like + n,
      ["topics[" + i + "].like"]: that.data.topics[i].like + n,
    })
    wx.cloud.callFunction({
      name: 'good',
      data: {
        database:"topic",
        id: id,
        like: that.data.like_num[i]
      },
    })
    if(that.data.isLike[i])
    {
      db.collection('user').doc(app.globalData.id).update({
        data:{
          good: db.command.push([id]),
        },
        success:function(){
          console.log("成功记录")
        }
      })
      wx.showToast({
        title: '点赞成功',
        icon: 'none',
        duration: 1500
      })
    }else{
          db.collection('user').doc(app.globalData.id).update({
            data:{
              good:db.command.pull(id)
            },
          })
      wx.showToast({
        title: '取消点赞',
        icon: 'none',
        duration: 1500
      })
    }
  },


  talkInput: function (e) {//输入文字
    var that = this;
    that.setData({
      talk: e.detail.value
    });
  },


  submit:function(event){//提交评论
    var that = this
    var date = app.dateFormat(new Date())
    var id = that.data.id;
    wx.cloud.callFunction({
      name: 'talk',
      data: {
        id: id,
        talk: that.data.talk,
        user: that.data.user,
        date: date
      },
      success: function () {
        that.setData({
          talk: '',
          showInput: false,
          focus: false,
        })
        wx.showToast({
          title: '评论成功',
          icon: 'none',
          duration: 1500
        })
        that.getData()
      }
    })
  },

  removeImg: function (event) {//删除预览图片
    var position = event.currentTarget.dataset.index;
    this.data.images.splice(position, 1);
    // 渲染图片
    this.setData({
      images: this.data.images,
    })
    if(!this.data.images.length){
      this.setData({
        show_image:0
      })  
    }
  },
  compare: function (property) {//比较
    return function (a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value2-value1;
    } 
  },
  previewImg: function (e) {//预览图片
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      //当前显示图片
      current: this.data.images[index],
      //所有图片
      urls: this.data.images
    })
  },


  // saveToHistoryServer: function (event) {//保存至历史记录
  //   db.collection('history').add({
  //     // data 字段表示需新增的 JSON 数据
  //     data: {
  //       content: that.data.content,
  //       date: new Date(),
  //       images: that.data.images,
  //       user: that.data.user,
  //       isLike: that.data.isLike,
  //     },
  //     success: function (res) {
  //       // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
  //       //console.log(res)
  //     },
  //     fail: console.error
  //   })
  // },

  getData: function () {//刷新数据
    var that = this
    if(app.globalData.hid){
    if(that.data.types!="")
    {
      db.collection("topic").where({ type: type }).skip((that.data.j - 2) * MAX_LIMIT).get({
        success: function (res) {
          res.data.sort(that.compare("compare"));
          that.setData({
            topics: res.data,
          })
          if(res.data.length==0)
          {
            wx.showToast({
              title: '暂无数据',
              icon: "none"
            })
          }else{
            for (var i = 0; i < that.data.topics.length; i++) {
              that.setData({
                ["talk_page[" + i + "]"]: 0,
                ["like_num[" + i + "]"]: that.data.topics[i].like,
              })
              if (res.data[i]._openid == app.globalData.openid) {
                that.setData({
                  ["showcancel[" + i + "]"]: true
                })
              }
              else {
                that.setData({
                  ["showcancel[" + i + "]"]: false
                })
              }
            }
          }
            wx.hideLoading()
        },
        fail: function (err) {
          console.log(err)
        }
      })
    }else{
    db.collection('topic').count().then(res => {
      console.log(res.total)
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
    db.collection('topic').skip((that.data.i-2)*MAX_LIMIT).get({
        success: function (res) {
          res.data.sort(that.compare("compare"));
          // res.data 是包含以上定义的两条记录的数组
          that.data.topics = res.data;
          that.setData({
            topics: that.data.topics,
          })
          for (var i = 0; i < that.data.topics.length; i++) {
            that.setData({
              ["talk_page[" + i + "]"]: 0,
              ["like_num[" + i + "]"]: that.data.topics[i].like,
            })
            if (res.data[i]._openid == app.globalData.openid) {
              that.setData({
                ["showcancel[" + i + "]"]: true
              })
            }
            else {
              that.setData({
                ["showcancel[" + i + "]"]: false
              })
            }
          }
          wx.hideLoading()
        },
        fail: function (event) {
         wx.showToast({
           title: '加载失败，请检查网络',
           icon:"none"
         })
        } 
      })
    })
    }
    }else{
      wx.showToast({
        title: '暂无数据',
        icon:'none'
      })
    }
  },

cancel:function(event){//收起评论
  var index = event.currentTarget.dataset.i;
    this.setData({
      ["talk_page[" + index + "]"]: 0
    })
  //console.log(this.data.talk_page)
},

more:function(event){//展开评论
  console.log(this.data.talk_page)
  var index = event.currentTarget.dataset.i;
  if (this.data.talk_page[index] * 5 < this.data.topics[index].talk.length)
  {
    this.setData({
      ["talk_page[" + index + "]"]: this.data.talk_page[index] + 1
    })
  }
  console.log(this.data.talk_page, this.data.topics[index].talk.length)
 },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.getD();
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
    if (that.data.types!="")
    {
      if (that.data.topics.length < that.data.type_total) {
      db.collection("topic").where({ type: that.data.types}).skip((that.data.j - 3) * MAX_LIMIT).limit(MAX_LIMIT).get({
        success: function (res) {
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
              topics: totalTopic,
              j:that.data.j - 1
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
    }else{
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none',
        duration: 1500
      })
    }
    }
    else
    {
    if (that.data.topics.length < that.data.totalCount) {
      db.collection('topic').skip((that.data.i-3) * MAX_LIMIT).limit(MAX_LIMIT).get({
        success: function (res) {
          console.log(res)
          res.data.sort(that.compare("compare"));
          if (res.data.length > 0) {
            for (var i = 0; i < res.data.length; i++) {
              var tempTopic = res.data[i];
              //console.log(tempTopic);
              temp.push(tempTopic);
            }
            var totalTopic = {};
            totalTopic = that.data.topics.concat(temp);
            console.log(totalTopic);
            that.setData({
              i:that.data.i-1,
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
    else{
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none',
        duration: 1500
      })
    }

    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },


  
  /**审核模式 */
  compare: function (property) {//比较
    return function (a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value2 - value1;
    }
  },
  getD: function () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    db.collection('news').skip((that.data.k) * MAX_LIMIT).limit(MAX_LIMIT).get({
      success: function (res) {
        res.data.sort(that.compare("compare"));
        //console.log(res.data)
        that.data.news = res.data;
        for (var i in res.data) {
          for (var j in res.data[i].images) {
            if (that.data.news[i].images[j].indexOf("//f") != -1) {
              that.data.news[i].images[j] = "https:" + that.data.news[i].images[j] + "?x-oss-process=image/resize,m_fill,h_70,w_95"
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
})
