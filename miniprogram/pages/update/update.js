const app = getApp();
Page({
  data: {
    //用来获取上菜单的长度和宽度
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    ColorList: app.globalData.ColorList,
  },
  onLoad: function () {

      },
  //回退
  pageBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
