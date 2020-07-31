const app = getApp();
const sm2 = require('miniprogram-sm-crypto').sm2;
const db = wx.cloud.database({
  env: 'hainanu-3ozvd'
})
const publicKey = "04a312bb3d6b59e339319ce812b90c2622bf9399afa8feac44351b8de44e4710d6cdeaad9c70d95ba778bd7eed794cf01a84933d789af33e4e2dc9fdcf8da96f48";
Page({
  data: {
    remind: '加载中',//加载页面
    angle: 0,//logo角度，随重力变化
    semester: [],//学期
    year:'',//当前学期年份
    id:"",//全局ID,用于更改数据库操作时方便使用
  },
  onReady() {
    // 设置加载超时时间
    setTimeout(() => {
      this.setData({
        remind: ''
      });
    }, 1000);
    //设置角度随重力变化
    wx.onAccelerometerChange((res) => {
      let angle = -(res.x * 30).toFixed(1);
      if (angle > 14) {
        angle = 14;
      } else if (angle < -14) {
        angle = -14;
      }
      if (this.data.angle !== angle) {
        this.setData({
          angle: angle
        });
      }
    });
    
  },


  onLoad() {
    //加载标题
    wx.setNavigationBarTitle({
      title: `HiCollege`
    })
    //计算当前学期年份
    var that = this;
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    var n = timestamp * 1000;
    var date = new Date(n);
    //年  
    var Y = date.getFullYear();
    //月  
    var M = date.getMonth()
    if (M > 8) {
      that.data.year = Y + '-' + (Y + 1) + '-' + 1
    }
    else {
      that.data.year = (Y - 1) + '-' + Y + '-' + 2
    }
    app.globalData.year = that.data.year
  },

  onQuery: function (options) {
    var animation = wx.createAnimation({
      duration: 5000,
      timingFunction: 'ease',
    });
    
    animation.opacity(0.4).translate(-500,20).step()
    this.setData({
      ani: animation.export()
    })
    var that = this;
  //尝试获取用户信息
    wx.getUserInfo({
      success: function (res) {
        //成功，说明用户已授权登录过
        //将用户信息（头像、名称赋值给全局变量和本地变量）
        app.globalData.nickName = res.userInfo.nickName;
        app.globalData.avatarUrl = res.userInfo.avatarUrl;
        //尝试获取用户的openid
          wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {//成功，说明用户已授权
              //console.log('[云函数1] [login] user openid: ', res.result.openid)
              app.globalData.openid = res.result.openid;
              //console.log(app.globalData.openid)
                  db.collection('user').where({
                    _openid: app.globalData.openid,
                  }).get({
                    success: res => {
                      if (!res.data[0]) {
                        //console.log('用户名不存在')
                        wx.switchTab({
                          url: '../me/me',
                        })
                      } else {
                        app.globalData.semester = res.data[0].semester
                        app.globalData.message = res.data[0].message
                        app.globalData.scores = res.data[0].score
                        app.globalData.course = res.data[0].course
                        app.globalData.student_id = res.data[0].student_id
                        app.globalData.id = res.data[0]._id
                        app.globalData.check_course = res.data[0].check_course
                        app.globalData.school = res.data[0].school
                        app.globalData.avg_score = res.data[0].avg_score
                        for (var i in app.globalData.schools) {
                          if (app.globalData.school == app.globalData.schools[i]) {
                            var this_url = app.globalData.school_url[i]
                          }
                        }
                        try {
                          if (res.data[0].name != app.globalData.nickName || res.data[0].photo != app.globalData.avatarUrl) {
                            console.log("头像已变")
                            db.collection('user').doc(res.data[0]._id).update({
                              data: {
                                name: app.globalData.nickName,
                                photo: app.globalData.avatarUrl
                              }
                            })
                          }
                        } catch (error) {
                          console.log(error)
                          wx.hideLoading()
                          wx.showToast({
                            title: '出错啦！请重新登录',
                            icon: 'none',
                            duration: 1500
                          })
                          db.collection('user').doc(app.globalData.id).remove({
                            success: res => {
                              console.log("删除成功")
                              app.globalData.hid = 0
                              wx.clearStorageSync()
                              wx.reLaunch({
                                url: '../login/login',
                              })
                            },
                          })
                        }
                        //尝试登录教务系统，获取token
                        wx.cloud.callFunction({
                          name: 'http',
                          data: {
                            id: app.globalData.id,
                            url: sm2.doEncrypt(this_url + 'app.do?method=authUser&xh=' + res.data[0].student_id + '&pwd=', publicKey, 'login'),
                          },
                          success: res => {
                            //console.log(res)
                            if (JSON.parse(res.result) != '失败') {
                              if (JSON.parse(res.result)['token'] != -1) {
                                app.globalData.hid = 1
                                app.globalData.token = JSON.parse(res.result)['token']
                                app.getall(this_url).then(res => {
                                  db.collection('user').doc(app.globalData.id).update({//更新新的信息
                                    data: {
                                      course: app.globalData.course,
                                      score: app.globalData.scores,
                                      semester: app.globalData.semester,
                                      message: app.globalData.message,
                                      avg_score: app.globalData.avg_score,
                                    },
                                  })
                                })
                                // if (app.globalData.semester.length == 0 || app.globalData.scores.length == 0 || Object.keys(app.globalData.message).length == 0) {
                                //   console.log('存在未加载成功数据')
                                //   wx.showToast({
                                //     title: '登录信息有误，请重新登录',
                                //     icon:'none'
                                //   })
                                //   db.collection('user').doc(app.globalData.id).remove({
                                //     success: res => {
                                //       console.log("删除成功")
                                //       app.globalData.hid = 0
                                //       wx.clearStorageSync()
                                //       wx.reLaunch({
                                //         url: '../login/login',
                                //       })
                                //     },
                                //   })
                                // }
                                //console.log(app.globalData)
                                if (app.globalData.semester[app.globalData.semester.length - 1] != app.globalData.year) {
                                  app.globalData.semester.push(app.globalData.year)
                                  app.getall(this_url).then(res => {
                                    console.log('学期已变')
                                    db.collection('user').doc(app.globalData.id).update({
                                      data: {
                                        semester: app.globalData.semester,
                                        score: app.globalData.scores
                                      }
                                    })
                                  })
                                }else{
                                  wx.switchTab({
                                    url: '../shouye/shouye',
                                  })
                                }
                              }
                              else {
                                wx.showToast({
                                  title: '账号已过期！请重新登录',
                                  icon: 'none',
                                  duration: 1500
                                })
                                wx.switchTab({
                                  url: '../me/me',
                                })
                              }
                            } else {
                              wx.showToast({
                                title: '登陆失败，请重试',
                                icon: 'none'
                              })
                              wx.reLaunch({
                                url: '../welcome/welcome',
                              })
                            }
                          },
                          fail: function (res) {
                            console.log(res)
                            wx.reLaunch({
                              url: '../me/me',
                            })
                          }
                        })
                  //判断是否存在此班级
                  if (res.data[0].message.bj){
                  db.collection('classroom').where({ name: res.data[0].message.bj }).get({
                    success: function (res) {
                      if (res.data.length != 0) {
                        for (var i = 0; i < res.data[0].students.length; i++) {
                          if (res.data[0].students[i].name == app.globalData.message.xm) {
                            break
                          }
                        }
                       // console.log(i, res.data[0].students.length)
                        if (i >= res.data[0].students.length) {
                          console.log("加入班级", res.data[0]._id)
                              var this_students = {
                                id: app.globalData.student_id,
                                name: app.globalData.message.xm,
                                local: false,
                                photo: app.globalData.avatarUrl,
                                nickName: app.globalData.nickName
                              }
                          wx.cloud.callFunction({
                            name: 'getstudents',
                            data: {
                              id:res.data[0]._id,
                              students: this_students
                            },
                            success: res => {
                             // console.log(res)
                            }
                          })
                        }
                      }
                      else {
                        db.collection('classroom').add({
                          data: {
                            name: app.globalData.message.bj,
                            manager: "",
                            school: app.globalData.school,
                            students: [{
                              id: app.globalData.student_id,
                              name: app.globalData.message.xm,
                              local: false,
                              photo: app.globalData.avatarUrl,
                              nickName: app.globalData.nickName
                            }],
                            assignment: {
                              location: {
                                lat: 0.0,
                                lng: 0.0,
                                range: 0
                              },
                              during: {
                                time: "",
                                during: 0
                              }
                            }
                          }
                        })
                      }
                    },
                    fail:function(res){
                      console.log(res)
                    }
                  })
                }
                      }
                    }
              })
            },
       fail: function (res) {
         wx.switchTab({
           url: '../me/me',
         })
       }
    })

    },
    fail:function(res){
      wx.switchTab({
        url: '../me/me',
      })
    }
    
})

  }
})