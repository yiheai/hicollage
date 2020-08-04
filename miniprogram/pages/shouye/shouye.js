//index.js
//获取应用实例
const app = getApp()
const db = wx.cloud.database({
  env: 'hainanu-3ozvd'
})
Page({
  data: {
    msgList: [{ 'title': '遇到BUG请联系管理员QQ：1500212833', 'image': "https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/20200216165323_njpoa.jpg?sign=a18178960a40f063f48e12bcf667206a&t=1590499077" }, { 'title': '校内常用电话：校医院：66291239，校保卫处：66271110，后勤服务热线：66279999，学生保卫处：66291070', 'image':'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/QQ%E5%9B%BE%E7%89%8720200603183016.jpg?sign=e9d14e34c1766c980875f2bf55f32317&t=1591180507'}],//滚动条，想不到吧，静态编写的。
    current: 0,
    show_register: "",
    images:[],
    remind:1,
    distance:0,
    lat:0.0,
    lng:0.0,
    id:"",
    manage:"",
    path_list:[],
    image_filepath:[],
    storage:false
  },
  //判断距离，如果小于设定值则可以签到
  distance: function (lat1, lng1, lat2, lng2) {
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 100;
    return s
  },
  //预览图片
  imgYu: function (event) {
    var src = event.currentTarget.dataset.src;//获取data-src
    var url = []
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls:url.concat(src)
    })
  },
  //获取图片的真实大小
  imageLoad: function (e) {
    var width = e.detail.width,    
      height = e.detail.height,
      ratio = width / height;
      if (ratio>1){
        var viewWidth = 750,
          viewHeight = 750 / ratio;
        var image = this.data.images;
      }
      else{
        var viewHeight = 750,
          viewWidth = 750 * ratio;
        var image = this.data.images;
      }
      //将图片的真实大小按比例放缩
    image[e.target.dataset.index] = {
      width: viewWidth,
      height: viewHeight
    }
    this.setData({
      images: image
    })
  },
register:function(){
  //判断是否签到
  var that = this
  db.collection('classroom').where({
    students: db.command.elemMatch({
      id: app.globalData.student_id
    })
  }).get({
    success: function (res) {
      that.setData({
        show_register: res.data[0].students[0].local
      })
    }
  })
},
  onShow:function(){
    if(app.globalData.hid)
    {
    this.register()
    }
  },
  onReady() {
    // 设置加载超时时间
    setTimeout(() => {
      this.setData({
        remind: ''
      });
    }, 2000);
  },

//获取图片缓存
getStorages:function(i){
  var that =this
    if(that.data.msgList[i].image.indexOf('//f')!=-1){
      that.data.msgList[i].image = 'https:'+that.data.msgList[i].image
    }
    wx.downloadFile({
      url: that.data.msgList[i].image,
      success: function (res) {
        if (res.statusCode === 200) {
          const fs = wx.getFileSystemManager()
          fs.saveFile({
            tempFilePath: res.tempFilePath, // 传入一个临时文件路径
            success(res) {
              that.setData({
                path_list: that.data.path_list.concat(res.savedFilePath)
              })
              if(i<that.data.msgList.length-1)
              {
                i++;
                that.getStorages(i)
              }else{
                wx.setStorageSync('image_cache', that.data.path_list)
              }
            },fail:function(res){
              console.log(res)
            }
          })
        } else {
          console.log('响应失败', res.statusCode)
        }
      }
    })
},
  onLoad: function () {
    var that = this
    var list = []
    var path_list = []
        const path = wx.getStorageSync('image_cache')
        if (path != "") {
          //console.log('path====', path)
          that.setData({
            storage:true,
            image_filepath: path
          })
          console.log("已缓存")
        } else {
          console.log("缓存")
          that.getStorages(0)
      }
  },
 
  share: function () {
    wx.navigateTo({
      url: '../share/share',
    })
  },
  news: function () {
    wx.navigateTo({
      url: '../news/news',
    })
  },
  test: function () {
    wx.navigateTo({
      url: '../test/test',
    })
  },
  local: function () {
    var that = this
    if(!app.globalData.hid){
      wx.showToast({
        title: '请先登录！',
        icon:"none"
      })
    }
    else{
      db.collection('classroom').where({ name: app.globalData.message.bj }).get({
        success: function (res) {
          //console.log(res)
           var distance=res.data[0].assignment.location.range
           var lat =  res.data[0].assignment.location.lat
           var lng = res.data[0].assignment.location.lng
           var id = res.data[0]._id
          var manage =  res.data[0].manager
    if (manage=="")
    {
      wx.showModal({
        title: '提示',
        content: '该班级尚无管理员，无法进行签到，是否成为管理员',
        success: function (res) {
          if (res.confirm) {
            db.collection('classroom').doc(id).update({
              data: {
                manager: app.globalData.message.xm
              },
              success: res => {
                that.setData({
                  manage: app.globalData.message.xm
                })
                wx.showToast({
                  title: '恭喜你成为管理员',
                  icon: "none",
                  during: 2000
                })
                wx.navigateTo({
                  url: '../local/local',
                })
              },
            })
          } else {
            console.log('用户点击取消')
          }
        }
      })
    }else{
    if(that.data.show_register==false){
      wx.showLoading({
        title: '签到中',
      })
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        const latitude = res.latitude
        const longitude = res.longitude
        if(distance > that.distance(latitude,longitude,lat,lng))
        {
          //console.log(id, app.globalData.student_id )
          wx.cloud.callFunction({
            name: 'update',
            data: {
              id:id,
              student_id:app.globalData.student_id              
            },
            success: res => {
              wx.hideLoading()
              if(res.result == true){
                wx.showToast({
                  title: '签到成功！',
                  icon:"none"
                })
                that.setData({
                  show_register: true
                })
                if (manage == app.globalData.message.xm) {
                  wx.navigateTo({
                    url: '../local/local',
                  })
                }
              }else{
                if (manage == app.globalData.message.xm) {
                  wx.navigateTo({
                    url: '../local/local',
                  })
                }
                wx.showToast({
                  title: '签到失败，时间已过！',
                  icon: "none"
                })
              }
            }
        })
        }
        else{
          if (manage == app.globalData.message.xm) {
            wx.hideLoading()
            console.log("我是管理员")
            wx.navigateTo({
              url: '../local/local',
            })
          }
          wx.hideLoading()
          wx.showToast({
            title: '超过签到范围！！',
            icon: "none"
          })
        }
      },
    })
    }
    else{
      wx.hideLoading()
      if (manage == app.globalData.message.xm) {
        wx.hideLoading()
        console.log("我是管理员")
        wx.navigateTo({
          url: '../local/local',
        })
      }
      wx.showToast({
        title: '已签到！',
        icon: "none"
      })
    }
    }
        }
      })
    }
  },
})
