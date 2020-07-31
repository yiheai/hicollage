var app = getApp();
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
    course:[],
    showModal: false,//添加课表的悬浮窗口控制
    colorArrays: ["#85B8CF", "#90C652", "#e0e725", "#FC9F9D", "#0A9A84", "#61BC69", "#12AEF3", "#E29AAD"],//课表的颜色库
    multiArray1: [],//存放学期变量
    multiIndex1: [],//存放选中的学期索引值
    multiArray2: [],//存放周次变量
    multiIndex2: [],//存放选中的周次索引值
    modalhidden: true,//详细信息悬浮窗口
    id:"",
    wlist: [//课表变量数组
    ],
    time1:['07:40','08:35','09:45','10:40',''],//上午时间
    time2:['14:40', '15:35', '16:30', '17.25', '19:30', '20:25', '21:20'],//下午时间
    times:[],
    runyue:[1,3,5,7,8,10,12],
    pinyue:[4,6,9,11],
    show_thisday:null,
    showmask:false
  },


  showCardView:function(event){//详细信息悬浮窗口
    var that = this
   // console.log(that.data.course, that.data.course[event.currentTarget.dataset.index]['kcmc'])
    that.setData({
      showModal: true,
      showmask:true,
      kcmc: that.data.course[event.currentTarget.dataset.index]['kcmc'],//课程名称
      jsxm: that.data.course[event.currentTarget.dataset.index]['jsxm'],//教师姓名
      jsmc: that.data.course[event.currentTarget.dataset.index]['jsmc'],//教室名称
      kkzc: that.data.course[event.currentTarget.dataset.index]['kkzc'],//上课周次
      wid: that.data.course[event.currentTarget.dataset.index]['kcmc'].length//课程名称的长度
    })
    
  },

  showpicker:function(){//picker窗口活动初始化
    this.setData({
      showpicker: '',
    })
  },
  CancelModal: function () {//遮挡窗口初始化
    this.setData({
      showModal: false,
      showmask:false,
      modalhidden: true
    })
  },
  deal_course() {//对获取的course进行处理
    var that = this
    for (var i = 0; i < that.data.course.length; i++) {//删除值为NULL的项
      if (that.data.course[i] == null) {
      that.data.course.splice(i,1)
      }
    }
    for (var i = 0; i < that.data.course.length; i++) {//处理course的值并存入wlist
        if (parseInt(that.data.course[i].kcsj.substring(2, 3)) > 4) {
          that.setData({
            ["wlist[" + i + "].sksj"]: parseInt(that.data.course[i].kcsj.substring(2, 3)) + 1,
             ["wlist[" + i + "].skcd"]: (that.data.course[i].kcsj.length - 1) / 2,
          })
        }
        else{
          if ((parseInt(that.data.course[i].kcsj.substring(2, 3)) + ((that.data.course[i].kcsj.length - 1) / 2)) > 5){
            that.setData({
              ["wlist[" + i + "].sksj"]: parseInt(that.data.course[i].kcsj.substring(2, 3)),
              ["wlist[" + i + "].skcd"]: ((that.data.course[i].kcsj.length - 1) / 2) + 1,
            })
          }
          else{
            that.setData({
              ["wlist[" + i + "].sksj"]: parseInt(that.data.course[i].kcsj.substring(2, 3)),
              ["wlist[" + i + "].skcd"]: (that.data.course[i].kcsj.length - 1) / 2,
            })
          }
        }
        that.setData({
          ["wlist[" + i + "].xqj"]: that.data.course[i].kcsj.substring(0, 1),
          ["wlist[" + i + "].kcmc"]: that.data.course[i].kcmc,
          ["wlist[" + i + "].jsmc"]: that.data.course[i].jsmc,
          ["wlist[" + i + "].jsxm"]: that.data.course[i].jsxm,
        })
      wx.hideLoading()
    }
  },


deal_picker(){//对学期和周次picker的综合处理
var that = this
    wx.cloud.callFunction({//从云函数中请求当前course
      name: 'course',
      data: {
        url:sm2.doEncrypt('http://jxgl.hainu.edu.cn/app.do?method=getKbcxAzc&xh=' + app.globalData.student_id + '&xnxqid=' + that.data.multiArray1[that.data.multiIndex1] + '&zc=' + (parseInt(that.data.multiIndex2) + 1),publicKey, app.globalData.token),
        "token": app.globalData.token
      },
      success: res => {
        if (res.result[0] != null) {//如果不是空
          that.setData({
            course: res.result
          })
            db.collection('user').where({
              course: db.command.elemMatch({
               zc: (parseInt(that.data.multiIndex2)+1)
               })
            }).get({
              success: res => {
                if (res.data.length>0)
                {
                  for (var i in res.data[0].course)
                  {
                    that.setData({
                      course: that.data.course.concat(res.data[0].course[i].course)
                    })//将指定周次的course添加进course中
                  }
                }
                that.deal_course() //对获取的course进行处理
              },
            })
        }
        else {
          if (res.result[0] == '失败') {//请求失败，再次请求
          that.deal_picker()  
            }
          else{//如果返回值是空
          wx.showToast({
            title: '暂无课程',
            icon: 'none',
            duration: 1500
          })
        }
        }
      },
      fail: function (res) {//云函数调用失败
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none',
          duration: 1200
        })
      }
    })
},

  pickerTap1: function () {//点击学期picker触发事件
    var that = this
    var semester = app.globalData.semester
    //学期
    that.setData({
      showpicker:1,//显示学期picker处于活动状态
      multiArray1:semester
    })
  },


  pickerTap2: function () {//点击周次picker触发事件
    var that = this
    var zc = [] 
    var MAXzc = 20//定义最多周次为20周
   // console.log('problem1', that.data.multiArray2, that.data.multiIndex2)
    for (var i=0;i<MAXzc;i++){
      zc.push('第' + (i + 1) + '周')
    }
    that.setData({
      showpicker:2,
      multiArray2: zc
    })
  },
  


  bindChange1: function (e) {//改变学期picker时点击确定触发
    wx.showLoading({
      title: '加载中'
    })
    var that = this;
    that.setData({
      wlist:[],//重新定义课表数组
      course:[]//重新初始化课表
    })
    that.setData({
      showpicker: '',//初始化picker显示状态
      multiIndex1: e.detail.value//对学期picker值赋值
    })
   that.deal_picker()
  },
 

  bindChange2: function (e) {//改变周次索引值点击确定时触发
    wx.showLoading({
      title: '加载中'
    })
    var that = this;
    that.setData({
      wlist: [],//初始化课表数组
      course: []//初始化课表
    })
    that.setData({
      showpicker: '',//初始化picker显示状态
      multiIndex2: e.detail.value,//对周次索引值赋值
      times:[]
    })

    that.deal_picker()
  },

  dateFormat: function (date) {//时间获取
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var realMonth = month > 9 ? month : "0" + month
    var realday = day > 9 ? day : "0" + day
    return year + "-" + realMonth + "-" + realday
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.hid) {
      wx.showLoading({
        title: '加载中'
      })
      var i = 0
      var that = this;
      var zc = []
      var MAXzc = 20
      var date = that.dateFormat(new Date())
      for (var i = 0; i < MAXzc; i++) { //初始化周次picker
        zc.push('第' + (i + 1) + '周')
      }
      for (var i in app.globalData.schools) {
        if (app.globalData.school == app.globalData.schools[i]) {
          var this_url = app.globalData.school_url[i]
        }
      }
     // console.log(this_url, app.globalData.token)
      wx.cloud.callFunction({//从云函数中请求当前course
        name: 'course',
        data: {
      url: sm2.doEncrypt(this_url+'/app.do?method=getCurrentTime&currDate=' + date, publicKey, app.globalData.token),
          "token":app.globalData.token
        },
        success: res => {
          if (res.result.length != 0 && res.result.s_time!=null) {//如果不是空
            that.setData({
              multiArray1: app.globalData.semester,
              multiArray2: zc,
              multiIndex1: app.globalData.semester.length - 1,
              multiIndex2: res.result.zc-3,
            })
            var this_time = res.result.s_time.split('-')
            for(var i=0;i<7;i++)
            {
              that.setData({
                times: that.data.times.concat(parseInt(this_time[1]) + '月' + parseInt(this_time[2])+'日')
              })
              if (parseInt(this_time[2]) == parseInt(date.split('-')[2])) {
                that.setData({
                  show_thisday: i
                })
              }
              this_time[2]=parseInt(this_time[2])+1
              if (this_time[1]=='2')
              {
                if(parseInt(this_time[2])>28)
                {
                  this_time[1] = parseInt(this_time[1]) + 1
                  this_time[2] = 1
                }
              }
              else{
                if (that.data.runyue.indexOf(parseInt(this_time[1]))!=-1)
                {
                  if (parseInt(this_time[2]) > 31) {
                    this_time[1] = parseInt(this_time[1]) + 1
                    this_time[2] = 1
                  }
                }
                else{
                  if (parseInt(this_time[2]) > 30) {
                    this_time[1] = parseInt(this_time[1]) + 1
                    this_time[2] = 1
                  }
                }
              }          
            }
            that.deal_picker()
          }
          else {
            if (res.result == '失败') {//请求失败，再次请求
              that.deal_picker()
            }
            else {//如果返回值是空
              if (res.result.s_time == null){
                wx.showToast({
                  title: '好好享受假期吧！！',
                  icon: 'none',
                  duration: 1500
                })
                that.setData({
                  multiArray1: app.globalData.semester,
                  multiArray2: zc,
                  multiIndex1: app.globalData.semester.length - 1,
                })
              }else{
                wx.showToast({
                  title: '出错啦！',
                  icon: 'none',
                  duration: 1500
                })
              }
            }
          }
        },
        fail: function (res) {//云函数调用失败
          wx.showToast({
            title: '加载失败，请重试',
            icon: 'none',
            duration: 1200
          })
        }
      })
    }
  },

//获取自定义课程数据
  talkInput1: function (e) {
    var that = this;
    that.setData({
      talk1: e.detail.value
    });
  },
  talkInput2: function (e) {
    var that = this;
    that.setData({
      talk2: e.detail.value
    });
  },
  talkInput3: function (e) {
    var that = this;
    that.setData({
      talk3: e.detail.value
    });
  },
  talkInput4: function (e) {
    var that = this;
    that.setData({
      talk4: e.detail.value
    });
  },
    talkInput5: function (e) {
      var that = this;
      that.setData({
        talk5: e.detail.value
      });
    },




  
  join: function () {//显示自定义模块
    this.setData({
      modalhidden: false,
      showmask: true,
    })
  },



  modalchange: function (e) {//悬浮框信息收集
    var that = this
    var this_course = [{jsmc:"",jsxm:"",kcmc:"",kcsj:"",kkzc:""}]//课程收集变量
    var name = that.data.talk1//课程名称
    var teacher = that.data.talk2//教师名称
    var semester = that.data.talk3//上课周次
    var time = that.data.talk4//上课时间
    var position = that.data.talk5//上课地点
    var week = []
    var during = []
    var ZC=[]
    var s = 0
    this_course[0].jsmc = position
    this_course[0].jsxm = teacher
    this_course[0].kcmc = name
    this_course[0].kcsj = time
    this_course[0].kkzc = semester
   // console.log(semester)
    if (semester.indexOf(',') >= 0) {//操作周次，去除逗号
      week = semester.split(",")
    }else{
      if (semester.indexOf('，') >= 0){
        week = semester.split('，')
      }
      else{
        week.push(semester)
      }
    }
    for(var i=0;i<week.length;i++)
    {
      if (week[i].indexOf('-') >= 0) {//操作周次，去除横线
        ZC = week[i].split("-")
      } else {
        if (week[i].indexOf('—') >= 0) {
          ZC = week[i].split("—")
        }else{
          if (week[i].indexOf('－') >= 0) {
            ZC = week[i].split("－")
          } 
          else {
            ZC = week[i]
          }
        }
      }
      s=parseInt(ZC[0])//对周次进行操作。如1-20，变成数组[1,2,3,....20]
      during.push(parseInt(ZC[0]))
      during.push(parseInt(ZC[1]))
        while(during[during.length-2]<during[during.length-1]-1){
          s = parseInt(s+1)
          during.splice(during.length - 1,0,s)
        }
    }   
  //  console.log("dasd", app.globalData.course)
        app.globalData.course.push({
          course:this_course[0],
          zc:during
          })//赋值给全局，以填入数据库

    
    that.setData({//隐藏自定义模块
      modalhidden: true,
      showmask: false,
    })

    db.collection('user').doc(app.globalData.id).update({//存入数据库
      data: {
        course: app.globalData.course
      },
    success: res => {
     // console.log(res)
      if(res.stats.updated == 1)
      {
        wx.showToast({
          title: '更新成功',
          icon: 'none',
          duration: 1500
        })
        that.deal_picker()
      }
        },
        fail: err => {
          wx.showToast({
            title: '更新失败，请按要求填写',
            icon: 'none',
            duration: 1500
          })
          that.join()
        },
        })
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
    if (!app.globalData.hid){
      wx.showToast({
        title: '暂无课程',
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
