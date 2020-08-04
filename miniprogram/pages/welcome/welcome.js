const app = getApp();
const sm2 = require('miniprogram-sm-crypto').sm2;
const db = wx.cloud.database({
  env: 'hainanu-3ozvd'
})
const publicKey = "04a312bb3d6b59e339319ce812b90c2622bf9399afa8feac44351b8de44e4710d6cdeaad9c70d95ba778bd7eed794cf01a84933d789af33e4e2dc9fdcf8da96f48";//设置公钥，用于加密url等信息
Page({
  data: {
    remind: '加载中',//加载页面
    angle: 0,//logo角度，随重力变化
    semester: [],//学期
    id: "",//全局ID,用于更改数据库操作时方便使用
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
  //计算当前学期年份
current: function() {
var that = this;
  var timestamp = Date.parse(new Date());
  timestamp = timestamp / 1000;
  var n = timestamp * 1000;
  var date = new Date(n);
  //年  
  var Y = date.getFullYear();
  //月  
  var M = date.getMonth()
    if(M > 8) {
   return Y + '-' + (Y + 1) + '-' + 1
}
    else {
   return (Y - 1) + '-' + Y + '-' + 2
}
  },
  

  onLoad() {
    //加载标题
    wx.setNavigationBarTitle({
      title: `HiCollege`
    })
    app.globalData.year = this.current()
  },

//点击进入小程序
  onQuery: function (options) {
    //千纸鹤开始移动
    var animation = wx.createAnimation({
      duration: 5000,
      timingFunction: 'ease',
    });
    animation.opacity(0.4).translate(-500, 20).step()
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
            app.globalData.openid = res.result.openid;
            db.collection('user').where({//从数据库中取出存入的用户信息
              _openid: app.globalData.openid,
            }).get({
              success: res => {
                if (!res.data[0]) {//不存在此用户的设备信息
                  wx.switchTab({//转入个人界面
                    url: '../me/me',
                  })
                } else {//将用户信息赋值给全局变量
                  app.globalData.semester = res.data[0].semester//用户已读学期，格式【‘2017-1’，‘2017-2’】
                  app.globalData.message = res.data[0].message//用户学生信息
                  app.globalData.scores = res.data[0].score//用户学习成绩信息
                  app.globalData.course = res.data[0].course//用户自定义的课程信息
                  app.globalData.student_id = res.data[0].student_id//用户学号
                  app.globalData.id = res.data[0]._id//用户数据库中的唯一标识符
                  app.globalData.school = res.data[0].school//用户的学校信息
                  app.globalData.avg_score = res.data[0].avg_score//用户平均绩点
                  for (var i in app.globalData.schools) {//取出学校对应的强智科技API，也可用indexOf()，懒得改了-_-!
                    if (app.globalData.school == app.globalData.schools[i]) {
                      var this_url = app.globalData.school_url[i]
                    }
                  }
                  //尝试判断用户头像和用户昵称是否更改
                  //若更改则更新数据库
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
                    //这里是为了防止各种可能出现的数据异常，进行重新登录的情况。
                    db.collection('user').doc(app.globalData.id).remove({
                      success: res => {
                        console.log("删除成功")
                        app.globalData.hid = 0
                        //清除缓存
                        wx.clearStorageSync()
                        wx.reLaunch({
                          url: '../login/login',
                        })
                      },
                    })
                  }

                  //尝试登录教务系统，获取token，所有请求均进行url加密，并在云服务端解密
                  wx.cloud.callFunction({
                    name: 'http',
                    data: {
                      id: app.globalData.id,
                      url: sm2.doEncrypt(this_url + 'app.do?method=authUser&xh=' + res.data[0].student_id + '&pwd=', publicKey, 'login'),
                    },
                    success: res => {
                      //强智科技API有时候不太稳定，这里需要判断是否出现请求失败和请求错误的情况
                      if (JSON.parse(res.result) != '失败') {
                        if (JSON.parse(res.result)['token'] != -1) {
                          //用户登录标识码，说明已经获取了API最新信息
                          app.globalData.hid = 1
                          //保存此次登陆的token值，用于后续查询自习室和课表
                          app.globalData.token = JSON.parse(res.result)['token']
                          //全局函数，获取最新的信息传送给全局变量，
                          //（有人说为什么数据库传一遍这里请求传一遍，
                          //这是为了保证用户进入程序后能够成功显示信息）
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
                          //进入新的学期
                          //将新的学期记录到数据库
                          //这里为什么最后判断新学期，熟悉的同学可以看到，
                          //前面的API并没有输入时间信息，默认取的是最新的。
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
                          }
                          //如果还是老学期，那么就可以跳转页面啦~ 
                          else {
                            wx.switchTab({
                              url: '../shouye/shouye',
                            })
                          }
                        }
                        //如果请求错误，可能是密码改了，所以这里显示账号过期
                        else {
                          wx.showToast({
                            title: '账号已过期！请重新登录',
                            icon: 'none',
                            duration: 1500
                          })
                        //又跳转到登录页面啦~
                          wx.switchTab({
                            url: '../me/me',
                          })
                        }
                      //如果是请求失败，可能是网络原因，这里直接进入小程序，并显示登录失败
                      } else {
                        wx.showToast({
                          title: '登陆失败，请检查网络',
                          icon: 'none'
                        })
                        wx.switchTab({
                          url: '../shouye/shouye',
                        })
                      }
                    }
                  })
                  //欸？前面不是进入主页面了？为什么还有语句
                  //因为前面的云函数是异步请求啊，（相对来说）很慢哒（看我的良苦用心，把他放后面。。）
                  //判断是否存在此班级
                    db.collection('classroom').where({ name:app.globalData.message.bj}).get({
                      success: function (res) {
                        //遍历班级是否有你的名字，如果班级有则break。
                        if (res.data.length != 0) {
                          for (var i = 0; i < res.data[0].students.length; i++) {
                            if (res.data[0].students[i].name == app.globalData.message.xm) {
                              break
                            }
                          }
                          //说明遍历结束也没有结果
                          if (i > res.data[0].students.length) {
                            console.log("加入班级", res.data[0]._id)
                            var this_students = {
                              id: app.globalData.student_id,
                              name: app.globalData.message.xm,
                              local: false,
                              photo: app.globalData.avatarUrl,
                              nickName: app.globalData.nickName
                            }
                            //调用云函数来更新教室同学的信息。（云函数为服务器端权限，可以更改非创建者的记录值）
                            wx.cloud.callFunction({
                              name: 'getstudents',
                              data: {
                                id: res.data[0]._id,
                                students: this_students
                              }
                            })
                          }
                        }
                        //如果不存在这个班级，则创建一个班级
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
                              //任务列表
                              assignment: {
                                //签到的经纬度和签到范围
                                location: {
                                  lat: 0.0,
                                  lng: 0.0,
                                  range: 0
                                },
                                //签到任务的时间和持续范围
                                during: {
                                  time: "",
                                  during: 0
                                }
                              }
                            }
                          })
                        }
                      }
                    })
                  }
              }
            })
          },
          //如果是首次登录，直接到个人页面
          fail: function (res) {
            wx.switchTab({
              url: '../me/me',
            })
          }
        })

      },
      fail: function (res) {
        wx.switchTab({
          url: '../me/me',
        })
      } 
    })
  }
})