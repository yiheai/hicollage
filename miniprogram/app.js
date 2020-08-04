//app.js
const sm2 = require('miniprogram-sm-crypto').sm2;
const publicKey = "04a312bb3d6b59e339319ce812b90c2622bf9399afa8feac44351b8de44e4710d6cdeaad9c70d95ba778bd7eed794cf01a84933d789af33e4e2dc9fdcf8da96f48";
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now()),
    wx.setStorageSync('logs', logs)
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'hainanu-3ozvd',
        traceUser: true,
      })
    }
    this.globalData = {
      StatusBar:'',//用于获取顶部菜单栏的宽度
      CustomBar:'',//
      token:'',//用于请求强智科技API
      openid: '',//微信身份唯一标识码
      student_id: '',//学号
      semester:[],//从前学年
      scores:[],
      message:[],
      avg_score:null,
      school:'',//学生学校
      schools: ['测试学校1', '测试学校2', '测试学校3', '测试学校4', '测试学校5'],//支持学校集合
     //schools: ['海南大学', '湘潭大学', '南昌大学', '山东大学（威海）', '电子科技大学(中山学院)'],//支持学校集合
      school_url: ['http://jxgl.hainu.edu.cn/', 'http://jwxt.xtu.edu.cn/', 'http://jwc103.ncu.edu.cn/', 'http://jw.jwc.wh.sdu.edu.cn/', 'http://jwgln.zsc.edu.cn/'],//支持学校API
      course: [],//自定义课程
      year:'',//目前学年
      hid:0,//是否登录
      id:'',//user记录id
      c_out: [{
        text: '餐饮',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_1.svg?sign=965afd6a8872540829203cbf2e8a5fc2&t=1595069490'
      },
      {
        text: '交通',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_2.svg?sign=2254da203fee4ac18aec7da78a6ac805&t=1595069505'
      },
      {
        text: '住房',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_3.svg?sign=d3fbdae21ad8ad1bab67aaa45235e2c8&t=1595069513'
      },
      {
        text: '美容',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_4.svg?sign=45e96868a4a48037d97e4bbf4666d797&t=1595069523'
      },
      {
        text: '服饰',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_5.svg?sign=417a80dc3257a438f19fa07d391854e8&t=1595069534'
      },
      {
        text: '运动',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_6.svg?sign=92138906f267f2b55a7f57e8970709eb&t=1595069549'
      },
      {
        text: '旅游',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_7.svg?sign=6df45de041df729eaf7a77c35117f2cf&t=1595069560'
      },
      {
        text: '娱乐',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_8.svg?sign=03c99a71d4f651fa83aba581f3e54e6b&t=1595069571'
      },
      {
        text: '生活',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_9.svg?sign=371c39189ff3b9ce76c951c9b3db5fe3&t=1595069580'
      },
      {
        text: '医疗',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_10.svg?sign=cd9789933be8f81642c72a91017b6d5e&t=1595069589'
      },
      {
        text: '通讯',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_11.svg?sign=294a7246a0b1b056a2166b4d39375e68&t=1595069598'
      },
      {
        text: '学习',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_12.svg?sign=15cf81d5fe639f7a036a72c5e450e99c&t=1595069606'
      },
      {
        text: '礼物',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_13.svg?sign=4db879ed873a78dcf810263187317808&t=1595069613'
      },
      {
        text: '母婴',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_14.svg?sign=e849c1059966692d19cfee3f34c6ccb0&t=1595069622'
      },
      {
        text: '数码',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_15.svg?sign=5aa8b38010270b79ae5c320721ac43e1&t=1595069631'
      },
      {
        text: '零食',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_16.svg?sign=3e8f79f86daa8652f78187cd99638c67&t=1595069641'
      },
      {
        text: '购物',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_17.svg?sign=3fb21cde71ebe5437af9b859c40e46c7&t=1595069670'
      },
      {
        text: '其它',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/zc_18.svg?sign=d338afa92c88b3f576eb88eb1293b6dc&t=1595069680'
      }
      ],
      c_in: [{
        text: '工资',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/sr_1.svg?sign=6132ddebbd1a77b89372a54e79c78544&t=1595069693'
      },
      {
        text: '兼职',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/sr_2.svg?sign=8c8680599368bed8f5aede5cf1e74e57&t=1595069715'
      },
      {
        text: '礼金',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/sr_3.svg?sign=841062e7aa4a7531d1678cbfea1506ec&t=1595069725'
      },
      {
        text: '奖金',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/sr_4.svg?sign=e628329bce898e16e5667d2f067d10f8&t=1595069735'
      },
      {
        text: '其它',
        icon: 'https://6861-hainanu-3ozvd-1300460648.tcb.qcloud.la/sr_5.svg?sign=64f03bbcf93d8fdf596003968aa7564a&t=1595069743'
      }
      ],
    },
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 50;
        }
        console.log(this.globalData.CustomBar, this.globalData.StatusBar)
      }, fail: e => {
        console.log(e)
      }
    })
  },
  dateFormat: function (date) {//时间获取
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minutes = date.getMinutes()
    var seconds = date.getSeconds()
    var realMonth = month > 9 ? month : "0" + month
    var realHour = hour > 9 ? hour : "0" + hour
    var realMinute = minutes > 9 ? minutes : "0" + minutes
    var realSecond = seconds > 9 ? seconds : "0" + seconds
    return year + "-" + realMonth + "-" + day + " " + realHour + ":" + realMinute + ":" + realSecond
  },
  getUserInfo:function(cb){//获取微信身份信息
    var that = this;
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      });
    }
  },
  getscore(this_url) {//获取分数信息
    var sum = 0
    var xf_s = 0
    var xf_course = ["公共基础课", "学科基础课", "实践教学环节", "人文通识经典课", "专业选修课", "专业必修课", "专业课"]
    var avg_score = 0
    var that = this;
    wx.cloud.callFunction({//云函数请求数据
      name: 'score',
      data: {
        url: sm2.doEncrypt(this_url + "app.do?method=getCjcx&xh=" + that.globalData.student_id, publicKey, that.globalData.token),
        token: that.globalData.token
      },
      success: res => {
        if (res.result != '失败' && res.result.token!=-1) {
          for (var i = 0; i < res.result.length; i++) {
              that.globalData.semester[i]=res.result[i].xqmc
          }
          for (var i = 0; i < that.globalData.semester.length; i++) {
            for (var j = i + 1; j < that.globalData.semester.length; j++) {

              if (that.globalData.semester[i] === that.globalData.semester[j]) {
                that.globalData.semester.splice(j, 1);
                j--;
              }
            }
          }
          that.globalData.scores = res.result
        }
        else{
          that.getscore(this_url)
        }
        for (var i = 0; i < that.globalData.scores.length; i++) {//计算平均绩点
          for (var j = 0; j < xf_course.length; j++) {
            if (that.globalData.scores[i].kcxzmc == xf_course[j]) {
              if ((parseFloat(that.globalData.scores[i].zcj) - 60) / 10 + 1 > 4) {
                sum = sum + 4 * that.globalData.scores[i].xf
              }
              else {
                sum = ((parseFloat(that.globalData.scores[i].zcj) - 60) / 10 + 1) * that.globalData.scores[i].xf + sum
              }
              xf_s = xf_s + parseFloat(that.globalData.scores[i].xf)
            }
          }
        }
        avg_score = (sum / xf_s).toFixed(2)
        that.globalData.avg_score = avg_score
      }
    })
  },


  getmessage(this_url) {//获取学生信息
    var that = this;
    wx.cloud.callFunction({//调用云函数
      name: 'score',
      data: {
        url: sm2.doEncrypt(this_url + "app.do?method=getUserInfo&xh=" + that.globalData.student_id, publicKey, that.globalData.token),
        token: that.globalData.token
      },
      success: res => {
        if (res.result != '失败' && res.result.token != -1) {
          that.globalData.message = res.result
        }
        else {
          that.getmessage(this_url)
        }
      }
    })
  },


  // getcourse(i) {//获取课程表
  //   var that = this;
  //   wx.cloud.callFunction({
  //     name: 'course',
  //     data: {
  //       url: 'http://jxgl.hainu.edu.cn/app.do?method=getKbcxAzc&xh=' + that.globalData.student_id + '&xnxqid=' + that.globalData.year + '&zc=' + i,
  //       "token": that.globalData.token
  //     },
  //     success: res => {
  //      // console.log('[云函数2] [score] score id ', i, 'http://jxgl.hainu.edu.cn/app.do?method=getKbcxAzc&xh=' + that.globalData.student_id + '&xnxqid=' + that.globalData.year + '&zc=' + i)
  //       if (res.result != '失败') {
  //         that.globalData.course[i] = res.result;
  //       }
  //       else{
  //             that.getcourse(i)
  //       }
  //     }
  //   })
  // },


  async getall(this_url) {//获取所有数据（成绩、学生信息）
  console.log(this_url)
    await this.getscore(this_url)
    await this.getmessage(this_url)
    this.globalData.hid = 1
    return true
      // for (let i = 1; i <= 20; i++) {
      //   await this.getcourse(i)
      // }
  },
})
