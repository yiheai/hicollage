// pages/share/share.js
const db = wx.cloud.database({
  env: 'hainanu-3ozvd'
})
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    file:[],
    name:[],
    showModal:false,
    result:[],
    show_detail:false,
    detail:{},
    showmask:false,
    alist:[],
    showcancel:[],
    show:0,
    show_name:false,
    showLoading:false,
    isDown:[],
    progress:null,
    pic: ['https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/ppt.png?sign=0218c19337e982514d9a8a2bac42fe74&t=1596286493','https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/jpg.png?sign=b772ecd98c3e593bac133c267883c353&t=1596286756',
'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/docx.png?sign=19c24528688fd86451a1b991543f169d&t=1596286817',
'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zip%20(1).png?sign=554662de44b02b3c7c2d406a91739376&t=1596286853',]//ppt,jpg,docx,zip
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

  },

  cancel:function(event){//删除指定文档
    var that = this
    var i = event.currentTarget.dataset.i;
    wx.showModal({
      title: '注意',
      content: '是否要删除？',
      success: function (res) {
        if (res.confirm) {//确认删除
          db.collection('files').doc(i).remove({
            success: function () {
              that.show()
              wx.showToast({
                title: '删除成功！',
                icon: "none"
              })
            }
          })
        }
        else {
          console.log("点击取消")
        }
      },
      fail:function(res){
        wx.showToast({
          title: '请检查网络',
          icon:'none'
        })
      }
    })
  },

  choosefile:function(){//上传文件
    var that = this
    var url = "cloud://hainanu-3ozvd.6861-hainanu-3ozvd-1300460648/"
    that.setData({
      showLoading:true
    })
    wx.chooseMessageFile({
        type:'file',
        count:9,
        success: function (res) {
          // console.log(res)
          if(res.tempFiles.length == 0){
            wx.showToast({
              title: '请选择文件！',
              icon: 'none',
              mask: true,
            })
            that.setData({
              showLoading:false
            })
          }else{
          for (var i in res.tempFiles) {
            wx.cloud.uploadFile({
              cloudPath: res.tempFiles[i].name,
              filePath: res.tempFiles[i].path,
              success: res => {
                //console.log(res)
                that.setData({
                  name: that.data.name.concat(res.fileID.slice(url.length)),
                  file: that.data.file.concat(res.fileID),
                  showLoading:false,
                  show_name: true,
                })
                wx.hideLoading()
                wx.showToast({
                  title: '上传成功',
                  icon: 'none',
                  duration: 1500
                })
              },fail:function(res){
                wx.showToast({
                  title: '上传文件过大',
                  icon:'none',
                  during:2000
                })
                that.setData({
                  showLoading:false
                })
              }
            })
          }
          } 
        },fail:function(res){
          console.log(res)
          that.setData({
            showLoading: false
          })
        }
      })
  },


  removefile:function(event){//删除预览文件
    var position = event.currentTarget.dataset.index;
    this.data.name.splice(position, 1);
    this.setData({
      name: this.data.name,
    })
  },


  CancelModal:function(){//点击上传取消
    this.setData({
      showModal: false,
      show_detail: false,
      showmask: false,
    })
  },


  textInput:function(e){//索引检索框
    var search = e.detail.value
    var list = []
    var lists = []
    var words = []
    var word = ""
    var that =this
    if (e.detail.value) {
      this.setData({
        choise: e.detail.value
      })
      for (var i = 0; i < that.data.result.length; i++) {
        list = that.data.result[i].name.split('')
        console.log(list)
        words = []
        word = ""
        for (var j = 0; j < list.length; j++) {
          words.push(list[j])
          word = words.join("")
          console.log(word)
          if (word.indexOf(e.detail.value)!=-1) {
            lists.push(that.data.result[i])
            break
          }
        }
      }
      if (lists.length > 0) {
        console.log(lists)
        this.setData({
          alist: lists
        })
      }
      else {
        this.setData({
          alist: []
        })
        wx.showToast({
          title: '暂无资源',
          icon: 'none',
        })
      }
    }else{
      that.show()
    }
  },


  download:function(event){//下载，目前提供从腾讯浏览器打开下载
    var that = this
    var url = ""
    var i = event.currentTarget.dataset.i;
    wx.cloud.getTempFileURL({//获得下载uri
      fileList: [that.data.result[i].file],
      success: res => {
        url = res.fileList[0].tempFileURL
        that.setData({
          ["isDown["+i+"]"]:true
        })
        wx.getSavedFileList({  
          success(res) {
            res.fileList.forEach((val, key) => {
              wx.removeSavedFile({
                filePath: val.filePath
              });
            })
          }, fail: function (res) {
            console.log(res)
          }
        })
  const downloadTask= wx.downloadFile({//下载，存入缓存
      url:url,
      success: function (res) {
        if (res.statusCode == '200'){
        wx.saveFile({//保存至本地某处
          tempFilePath: res.tempFilePath,
          success: function (res) {
            const savedFilePath = res.savedFilePath;
            console.log(savedFilePath)
            wx.hideLoading()
            wx.openDocument({//打开文档
              filePath: savedFilePath,
              success: function (res) {
                console.log('打开文档成功')
              },
              fail:function(res){
                console.log('打开文档失败',res)
              }
            });
      },fail:function(res){
        console.log(res)
      }
    })
      }else{
          wx.hideLoading()
        wx.showToast({
          icon:'none',
          title: '下载失败，请检查网络',
          during:1500
        })
      }
      },
      fail: function (res){
        wx.hideLoading()
        console.log(res)
        wx.showToast({
          icon: 'none',
          title: '下载失败，请检查网络',
          during: 1500
        })
      }
    })
        setTimeout(function () {
          downloadTask.onProgressUpdate((res) => {
            if (res.progress === 100) {
              that.setData({
                ["isDown[" + i + "]"]: false
              })
            } else {
              console.log(res.progress)
              that.setData({
                progress: res.progress
              })
            }
          })
        }, 500)
      },
      fail:function(res){
        console.log(res)
      }
    })
  },

  showCardView: function () {//显示上传框
    this.setData({
      showmask: true,
      showModal: true
    })
  },

  previewfile: function (e) {//预览上传文件名
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.file[index],
      urls: this.data.file
    })
  },


  share:function(){//上传
    var that = this
    var date = app.dateFormat(new Date())
    that.setData({
      showModal: false,
      showmask: false,
    })
    if (!app.globalData.hid) {
      wx.showToast({
        title: '请先登录！',
        icon:"none"
      })
    }
    else{
      wx.showLoading({
        title: '上传中',
      })
      if (that.data.name.length == 0) {
        wx.showToast({
          title: '请选择文件！',
          icon: 'none',
          mask: true,
        })
      }else{
        wx.getUserInfo({
      success: function (res) {
        that.data.user = res.userInfo;
        for(var i=0;i<that.data.name.length;i++)
        { //将上传的文件逐一添加进数据库
          //console.log(that.data.file[i])
          db.collection('files').add({
            data: {
              file: that.data.file[i],
              user: that.data.user,
              name: that.data.name[i],
              date: date,
            },
            success: function (res) {
              that.show()//重新加载显示
            },
          })
        }
      }
    })
    }
    }
  },


  /**
   * 生命周期函数--监听页面显示
   */
detail:function(event){//点击查看详细信息
  var i = event.currentTarget.dataset.i;
  var that = this
  that.setData({
    showmask: true,
    show_detail:true,
    detail: that.data.result[i]
  })
},


show:function(){//加载页面
  var that = this
  db.collection('files').get({
    success: function (res) {
      for(var i in res.data)
      {
        if (res.data[i]._openid == app.globalData.openid)
        {//如果是本人创建则显示删除按钮
          that.setData({
           ["showcancel["+i+"]"]:true,
           ["isDown[" + i + "]"]: false
          })
        }
        else{
          that.setData({
            ["showcancel[" + i + "]"]: false,
            ["isDown[" + i + "]"]: false
          })
        }
      }
      that.setData({
        result: res.data,
        alist:res.data
      })
      wx.hideLoading()
    }
  })
},

  onShow: function () {
    if(app.globalData.hid){
      this.setData({
        show:1
      })
      wx.showLoading({
        title: '加载中',
      })
      this.show()
    }else{
      wx.showToast({
        title: '暂无内容',
        icon: "none"
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
  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
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