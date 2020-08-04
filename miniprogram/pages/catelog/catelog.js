// pages/bill/bill.js
const utils = require('./../../utils/util.js');
const db = wx.cloud.database({//存入数据库
  env: 'hainanu-3ozvd'
})
Page({
  data: {
    currentPage: 0,
    money: {
      getMoney: 0,
      useMoney: 0,
      restMoney: 0,
    },
    list: [],
    date: {
      year: utils.getYear(),
      month: utils.getMonth()
    }
  },
  onLoad: function (options) {
  },
  onShow: function () {
      wx.setNavigationBarTitle({
        title: '账单'
      });
      wx.showLoading({
        title: '数据努力加载中',
      });
      this.loadData(this);
  },

  bindDateChange(e) {
    const date = e.detail.value;
    let arr = date.split('-');
    this.setData({
      date: {
        year: arr[0],
        month: arr[1]
      }
    });
    this.loadData(this);
  },

  formatData(data) {
    // 最终的格式化后数据
    let finalData = {},
      finalList = [],
      getMoney = 0,
      useMoney = 0,
      restMoney = 0,
    { c_in, c_out } = getApp().globalData;
    // 保存不重复的日期
    let uniqueDate = new Set();
    for(var i=0;i<data.length;i++)
    {
      uniqueDate.add(new Date(utils.formatDate(data[i].createAt)).getTime());
    }
    console.log(111122321,uniqueDate)
    // 对uniqueDate降序排序, 并保存到 uniqueDates 中
    let uniqueDates = Array.from(uniqueDate).sort(utils.desc);
    for(var i=0;i<uniqueDates.length;i++){
      uniqueDates[i] = utils.formatDate(uniqueDates[i])
    }
    for(var i=0;i<uniqueDates.length;i++){
      finalList.push({ date: uniqueDates[i], expense: 0, income: 0, list: [] })
    }
    console.log(finalList)
    // 初始化 finalList
    for(var i=0;i<data.length;i++)
    {
     // 查询当前日期在uniqueDates的下标
      const index = uniqueDates.indexOf(utils.formatDate(data[i].createAt));
      console.log(index)
     // 计算总支出,总收入
      data[i].type === 0 ? useMoney += data[i].money : getMoney += data[i].money;
      // 计算某天的总支出,总收入
      data[i].type === 0 ? finalList[index].expense += data[i].money : finalList[index].income += data[i].money;
      
      finalList[index].week = data[i].getWeek;
      let types = data[i].type === 1 ? c_in : c_out;
      data[i].text = types[data[i].iconSelected].text;
      // 根据index将数据添加对应date的list中
      finalList[index].list.push(data[i]);
    }
    finalData = {
      list: finalList,
      money: {
        getMoney,
        useMoney,
        restMoney: getMoney - useMoney
      }
    };
    console.log('finalData', finalData)
    return finalData;
  },
  loadData: function (that) {
    var that = this
    let { year, month } = that.data.date;
    console.log(year + '/' + month)
    db.collection('catelog').where({
      _openid:getApp().openid,
      task: db.command.elemMatch({
         date:year+'/'+month})
         }).get({
      success:function(res)
      {
        if(res.data.length!=0){
          let { list, money } = that.formatData(res.data[0].task);
          that.setData({
            list: list,
            money: money
          })
        }
        else{
          console.log("ugly")
          that.setData({
            list: [],
            money: 
            {
            getMoney:0,
            useMoney:0,
            restMoney:0
            }
          })
        }
        console.log(that.data.list, money)
      },fail:function(res){
        console.log(1231231,res)
      }
    })
    wx.hideLoading()
  }
});