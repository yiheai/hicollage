// pages/addition/addition.js
const utils = require('./../../utils/util.js');
const db = wx.cloud.database({//存入数据库
  env: 'hainanu-3ozvd'
})
Page({
  data: {
    i:0,
    c_in:getApp().globalData.c_in,
    c_out: getApp().globalData.c_out,
    current: 0,
    showtimes: 0,
    isUpdate: false,
    data_out: {
      date: utils.getDate(),
      getWeek: utils.getWeek(),
      iconSelected: 0,
      notes: '',
      money: null,
    },
    data_in: {
      date: utils.getDate(),
      getWeek: utils.getWeek(),
      iconSelected: 0,
      notes: '',
      money: null,
    }
  },
  onLoad: function (options) {
    console.log(options);
    if (options.data) {
      let res = JSON.parse(options.data);
      let { type } = res;
      let data = {};
      let current = 0;
      console.log("asdsadsa",res)
      if (type === 0) {
        current = 0;
        data.data_out = res;
        this.setData({
          i: res.i,
          createAt:res.createAt,
          current,
          data_out: data.data_out,
          isUpdate: true,
        })
      } else {
        current = 1;
        data.data_in = res;
        this.setData({
          i: res.i,
          createAt: res.createAt,
          current,
          data_in: data.data_in,
          isUpdate: true,
        })
      }
    }
  },

  onReady: function () {
    wx.setNavigationBarTitle({
      title: '记一笔',
    });
  },
  outClick: function () {
    this.setData({
      current: 0
    });
  },
  inClick: function () {
    this.setData({
      current: 1
    });
  },
  changeCurrent: function (e) {
    this.setData({
      current: e.detail.current
    });
  },
  bindDateChange(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    const data_out = this.data.data_out;
    const data_in = this.data.data_in;
    if (this.data.current === 0) {
      data_out.date = e.detail.value;
      data_out.getWeek = utils.getWeek(e.detail.value);
      this.setData({
        data_out:data_out
      })
    } else {
      data_in.date = e.detail.value;
      data_in.getWeek = utils.getWeek(e.detail.value);
      this.setData({
        data_in: data_in
      })
    }
  },
  iconClick: function (e) {
    // console.log('current: ',this.data.current);
    let data_out = this.data.data_out;
    let data_in = this.data.data_in;
    // console.log(e.target.dataset.id)
    if (this.data.current === 0) {
      data_out.iconSelected = e.target.dataset.id;
      this.setData({
        data_out: data_out
      })
    }
    if (this.data.current === 1) {
      data_in.iconSelected = e.target.dataset.id;
      this.setData({
        data_in: data_in
      })
    }
  },
  watchNotes: function (e) {
    let data_out = this.data.data_out;
    let data_in = this.data.data_in;
    if (this.data.current === 0) {
      data_out.notes = e.detail.value;
      this.setData({
        data_out:data_out
      })
    } else {
      data_in.notes = e.detail.value;
      this.setData({
        data_in:data_in
      })
    }

  },
  watchMoney: function (e) {
    let data_out = this.data.data_out;
    let data_in = this.data.data_in;
    if (this.data.current === 0) {
      data_out.money = e.detail.value;
      this.setData({
        data_out:data_out
      })
    } else {
      data_in.money = e.detail.value;
      this.setData({
        data_in:data_in
      })
    }
  },
  handleSave: function (e) {
    wx.showLoading({
      title: '',
    });
    let data = this.data;
    let sendData;
    data.current === 0 ? sendData = data.data_out : sendData = data.data_in;
    sendData.type = data.current;
    console.log(3123123,sendData.money)
    if (sendData.money!=null) {
    if (!data.isUpdate){
      db.collection('catelog').where({ '_openid': getApp().openid}).update({
        data:{
          month: db.command.addToSet(utils.getYear() + utils.getMonth()),
          task:db.command.push({
            date: (utils.getYear() + '/' + utils.getMonth()),
            getWeek: sendData.getWeek,
            iconSelected: sendData.iconSelected,
            money: parseInt(sendData.money),
            notes: sendData.notes,
            tel: sendData.tel,
            type: sendData.type,
            createAt: new Date().getTime(),
          })
        },success:function(res){
          console.log(res)
          wx.hideLoading()
        },fail:function(res){
          console.log(res)
        }
      })
    }
    else{
      db.collection('catelog').where({
        '_openid':getApp().openid,
        'task.createAt':data.createAt,
      }).update({
          data: {
            'task.$.notes': sendData.notes,
            'task.$.money': parseInt(sendData.money),
            'task.$.type': sendData.type,
            'task.$.iconSelected': sendData.iconSelected
        },success: function (res) {
          console.log(res)
          wx.hideLoading()
        },fail:function(res){
          console.log(res)
        }
      })
    }
    wx.navigateBack({
      
    })
    }else{
      wx.showToast({
        title: '请输入金额',
        icon:'none'
      })
    }
  }
});