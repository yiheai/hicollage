// pages/chart/chart.js
const utils = require('./../../utils/util.js');
const wxCharts = require('./../../utils/wxcharts.js');
const {c_out, c_in } = getApp().globalData;
const db = wx.cloud.database({//存入数据库
  env: 'hainanu-3ozvd'
})
let lineChart = null;
let pieChart = null;
Page({
  data: {
    c_out:getApp().globalData.c_out,
    c_in:getApp().globalData.c_in,
    current: 0,
    date: {
      year: utils.getYear(),
      month: utils.getMonth()
    },
    ranking1: [],
    ranking2:[],
    line1: [],
    line2:[]
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '',
    });
    this.loadData(this);

  },
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '图表'
    });
    wx.hideLoading();
  },
  bindDateChange(e) {
    console.log()
    let date = e.detail.value;
    let arr = date.split('-');
    this.setData({
      date: {
        year: arr[0],
        month: arr[1]
      }
    });
    this.loadData(this);
  },
  handleChange(e) {
    console.log(e.target.dataset)
    let current = parseInt(e.target.dataset.current);
    this.setData({
      current
    });
    
  },
  touchHandlerLineCanvas: function (e) {
    console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      format: function (item, category) {
        return category + '日 ' + item.name + ':' + item.data
      }
    });
  },
  createSimulationData: function () {
    let categories = [];
    let data = [];
    for (let i = 1; i < 31; i++) {
      categories.push(i);
    }
    return {
      categories: categories,
      data: data
    }
  },
  drawLine: function () {
    let windowWidth = 100;
    try {
      let res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
    }
    let line1 = this.data.line1;
    let line2 = this.data.line2;

    if (line1.length !== 0) {
      let simulationData1 = this.createSimulationData();
      // 折线图
      lineChart = new wxCharts({
        canvasId: 'lineCanvas',
        type: 'line',
        categories: simulationData1.categories,
        animation: true,
        series: [{
          name: '支出',
          data: line1,
          format: function (val, name) {
            return val.toFixed(1) + '元';
          }
        },
        {
          name: '收入',
          data: line2,
          format: function (val, name) {
            return val.toFixed(1) + '元';
          }
        }],
        xAxis: {
          disableGrid: true
        },
        yAxis: {
          title: '金额/单位(元)',
          format: function (val) {
            return val.toFixed(0);
          },
      min:0
        },
        width: windowWidth,
        height: 200,
        dataLabel: false,
        dataPointShape: true,

        extra: {
          lineStyle: 'curve',
        }
      });
    }
    wx.hideLoading();
  },
  formatData(data) {
    let line1 = [], // 保存折线图的横纵坐标,一共 31 个元素, 下标表示日,值表示消费或支出
      line2=[],
      ranking1 = [],  // 排行列表
      ranking2 = [],
      uniqueSelection = new Set(), // 存储唯一的iconSelected
      uniqueSelections = [],   // 存储唯一的iconSelected
      total1 = 0,    // 总金额
      total2 = 0;
    // 初始化每一天的值为 0
    for (let i = 0; i < 31; i++) {
      line1[i] = 0;
      line2[i] = 0;
    }

    data.map((item) => uniqueSelection.add(item.iconSelected));
    uniqueSelections = Array.from(uniqueSelection);
    console.log(uniqueSelections)
    // 初始化 rankings
    // uniqueSelections.map((item) => rankings.push({ iconSelected: item, len: 0, name: '', money: 0 }));

    data.map((item) => {
      let day = new Date(utils.formatDate(item.createAt)).getDate(),   // 将每一天的消费或支出添加到对应下标的数组中
      // console.log(iconSelected)
         iconSelected = item.iconSelected,
         type = item.type;
      // 查找 iconSelected 在 uniqueSelections 的下标
      let index = uniqueSelections.indexOf(item.iconSelected);
      if (type === 0) {
        line1[day - 1] += item.money;   // 将日期和每天的支出收入如匹配
        ranking1.push({ iconSelected: item.iconSelected, len: 0, name: c_out[iconSelected].text, money: item.money });
        if (index > -1) {
          ranking1[index].len += 1;
        } else {
          ranking1[index].len = 1;
        }
        total1 += item.money;    // 总金额计算
      }
      if (type === 1) {
        line2[day - 1] += item.money;   // 将日期和每天的支出收入如匹配
        ranking2.push({ iconSelected: item.iconSelected, len: 0, name: c_in[iconSelected].text, money: item.money });
        if (index > -1) {
          ranking2[index].len += 1;
        } else {
          ranking2[index].len = 1;
        }
        total2 += item.money;    // 总金额计算
      }

    });
console.log(ranking1)
console.log(ranking2)
    return {
      line1,
      line2,
      ranking1,
      ranking2,
      total1,
      total2
    };

  },
  loadData: function (that) {
    wx.showLoading({
      title: '数据加载中...',
    });
    that.setData({
      ranking1: {},
       ranking2: {}
    });
    let { year, month } = that.data.date;
    db.collection('catelog').where({
      _openid: getApp().openid,
      task: db.command.elemMatch({
        date: year + '/' + month
      })
    }).get({
      success:function(res){
        if(res.data.length!=0){
        let data = that.formatData(res.data[0].task);
        console.log(data)
        that.setData({
          line1: data.line1,
          line2:data.line2,
          ranking1: data.ranking1,
          ranking2: data.ranking2,
          total1: data.total1,
          total2: data.total2
        });
        that.drawLine();
        }
        else{
          let line1=[],
          line2=[];
          for (let i = 0; i < 31; i++) {
            line1[i] = 0;
            line2[i] = 0;
          }
          that.setData({
            line1: line1,
            line2: line2,
            ranking1: [],
            ranking2: [],
            total1: 0,
            total2: 0
          });
          that.drawLine();
        }
      },fail:function(res){
        console.log(res)
      }

      })
  }
});