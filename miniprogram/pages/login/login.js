var app = getApp();
const sm2 = require('miniprogram-sm-crypto').sm2;
const db = wx.cloud.database({
  env: 'hainanu-3ozvd'
})
const publicKey = "04a312bb3d6b59e339319ce812b90c2622bf9399afa8feac44351b8de44e4710d6cdeaad9c70d95ba778bd7eed794cf01a84933d789af33e4e2dc9fdcf8da96f48"; //SM2加密算法
Page({
  data: {
    inputPassword: false,//是否显示输入框
    isLoading: false,//绑定只允许一次
    student_id: '',//学号
    student_pwd: '',//密码
    token: '',//强智科技API
    semester: [],//学期
    year: '',//当前学年
    id: '',//当前id
    alist: [],//下拉选框内容
    choise: "",//下拉框选择
    showlist: false,//是否显示下拉框
    school: "",//选择学校
  },//学校URI

  onReady: function () {
  },
  onShow() {
    this.setData({
      school: app.globalData.schools
    })
  },
  login() { //登录
    var that = this
    var this_url = ""
    for (var i = 0; i < this.data.school.length; i++) {
      if (this.data.choise == this.data.school[i]) {
        this_url = app.globalData.school_url[i]
      }
    }//选择学校的URI
    wx.showLoading({
      title: '绑定中'
    })
    that.setData({
      isLoading: true
    })//只允许生效一次
    wx.cloud.callFunction({//请求登录
      name: 'http',
      data: {
        url: sm2.doEncrypt(this_url + 'app.do?method=authUser&xh=' + that.data.student_id + '&pwd='+that.data.student_pwd, publicKey, 'login'),
      },
      success: res => {
        try {
          console.log(res)
          if (JSON.parse(res.result)['token'] != -1) { 
            app.globalData.token = JSON.parse(res.result)['token']//将token赋值给全局变量
            app.getall(this_url).then(res=>{
            wx.cloud.callFunction({//获取微信用户信息
              name: 'login',
              data: {},
              success: res => {
                app.globalData.openid = res.result.openid;
                db.collection('user').where({
                  _openid: app.globalData.openid,
                }).get({
                  success: res => {
                    if (!res.data[0]) {//判断是否存在用户
                      db.collection('user').add({
                        data: {
                          name: app.globalData.nickName,
                          student_id: app.globalData.student_id,
                          student_pwd: sm2.doEncrypt(that.data.student_pwd, publicKey, app.globalData.student_id + app.globalData.message.xm),//加密密码
                          photo: app.globalData.avatarUrl,
                          course: app.globalData.course,
                          score: app.globalData.scores,
                          semester: app.globalData.semester,
                          message: app.globalData.message,
                          avg_score: app.globalData.avg_score,
                          school: that.data.choise,
                          good: []
                        },
                        success: res => {
                          app.globalData.id = res._id//记录id
                          wx.switchTab({
                            url: '../shouye/shouye'
                          })
                          wx.hideLoading()
                        },
                        fail: err => {
                          wx.showToast({
                            icon: 'none',
                            title: '请检查网络'
                          })
                          console.error('[数据库] [新增记录] 失败：', err)
                        }
                      })
                    }
                    else {//已存在用户
                      app.globalData.hid = 1
                        db.collection('user').doc(app.globalData.id).update({//更新密码
                          data: {
                            student_pwd: sm2.doEncrypt(that.data.student_pwd, publicKey, app.globalData.student_id + app.globalData.message.xm),
                          },
                          success: res => {
                            console.log('密码更新成功')
                            wx.switchTab({
                              url: '../shouye/shouye'
                            })
                            wx.hideLoading()
                          },
                        })
                    }
                  }
                })
              },
            })
            })
}

          else {
            wx.showToast({
              title: '绑定失败,请检查学号密码',
              icon: 'none',
              duration: 1200
            })
          }
        } catch (error) {
          console.log(error)
          wx.showToast({
            title: '绑定失败,请检查学号密码',
            icon: 'none',
            duration: 1200
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '绑定失败，请检查网络',
          icon: 'none',
          duration: 1200
        })
      }
    });
  },



  onConfirm(e) { // 点击允许
    let dialogComponent = this.selectComponent('.wxc-dialog');
    dialogComponent && dialogComponent.hide();
    let userInfo = JSON.parse(e.detail.detail.rawData)
    if (!userInfo) {
      return;
    }
    this.setData({
      userInfo: userInfo
    })
    wx.setStorageSync('userInfo', userInfo)
    var that = this;
    wx.getUserInfo({//获得微信用户信息
      success: function (res) {
        var avatarUrl = 'userInfo.avatarUrl';
        var nickName = 'userInfo.nickName';
        app.globalData.nickName = res.userInfo.nickName;
        app.globalData.avatarUrl = res.userInfo.avatarUrl;
      }
    })
    that.login()
  },
  onCancel() { // 点击拒绝
    let dialogComponent = this.selectComponent('.wxc-dialog');
    dialogComponent && dialogComponent.hide();
    wx.removeStorage({
      key: 'userInfo',
      success: function () {
        wx.showModal({
          title: '提示',
          content: '是否允许获得公开信息',
          confirmText: '是',
          cancelText: '否',
          success: function (res) {
            if (res.cancel) {
              wx.showModal({
                title: '提示',
                content: '请允许获得头像和昵称',
                showCancel: false,
                confirmText: '我知道了',
              })
            } else {
              if (userInfo) {
                wx.showModal({
                  title: '提示',
                  content: '获取成功',
                  showCancel: false,
                  showConfirm: false,
                  confirmText: '好的',
                })
              }
            }
          },
        })
      }
    })
  },

  bind: function () {//绑定信息
    var that = this;
    var openid = app.globalData.openid;
    var student_id = that.data.student_id;
    app.globalData.student_id = student_id  
    let userInfo = wx.getStorageSync('userInfo')
    let dialogComponent = this.selectComponent('.wxc-dialog');
    if (!userInfo) {
      dialogComponent && dialogComponent.show();
    } else {
      wx.showLoading({
        title: '请耐心等待'
      })
      this.setData({
        userInfo: userInfo
      })
      dialogComponent && dialogComponent.hide();
      wx.getUserInfo({//获取用户信息
        success: function (res) {
          var avatarUrl = 'userInfo.avatarUrl';
          var nickName = 'userInfo.nickName';
          app.globalData.nickName = res.userInfo.nickName;
          app.globalData.avatarUrl = res.userInfo.avatarUrl;
          that.setData({
            avatarUrl: res.userInfo.avatarUrl,
            nickName: res.userInfo.nickName,
          })
        }
      })
      that.login()
    }
    app.globalData.school = that.data.choise
  },


  listshow: function () {//显示下拉框
    this.setData({
      showlist: !this.data.showlist,
      alist: this.data.school
    })
  },

  textInput: function (e) {//学校输入框
    var search = e.detail.value
    var list = []
    var lists = []
    var words = []
    var word = ""
    if (e.detail.value) {
      this.setData({
        showlist: true,
        choise: e.detail.value
      })
      for (var i = 0; i < this.data.school.length; i++) {
        list = this.data.school[i].split('')//将学校名称拆成数组
        //console.log(list)
        words = []
        word = ""
        for (var j = 0; j < list.length; j++) {//检索学校名称
          words.push(list[j])
          word = words.join("")
          //console.log(word)
          if (word.indexOf(e.detail.value) != -1) {
            lists.push(this.data.school[i])
            break
          }
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
        showlist: false
      })
    }
  },


  selected: function (event) {//选择下拉框值
    var i = event.currentTarget.dataset.i;
    console.log(i)
    this.setData({
      choise: this.data.alist[i],
      showlist: false,
    })
  },


  useridInput: function (e) {//输入学号
    this.setData({
      student_id: e.detail.value
    });
  },

  passwdInput: function (e) {//输入密码
    this.setData({
      student_pwd: e.detail.value
    });
  },

});