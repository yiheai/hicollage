// components/bill-list/bill-list.js
const utils = require('./../../utils/util.js');
Component({
  /**
   * Component properties
   */
  properties: {
    show:{
      type:Array,
    },
    data: Array
  },

  /**
   * Component initial data
   */
  data: {
  },

  /**
   * Component methods
   */
  methods: {
    handleDelete(e) {
      const id = e.target.dataset.id;
      const that = this;
      wx.showModal({
        title: '警告',
        content: '您确定要删除此条记录',
        success(res) {
          if (res.confirm) {
            // console.log('用户点击确定')
            wx.showLoading({
              title: '',
            });
            that.del(that, id);
          }
        }
      })
    },
    showdetail:function(e){
      var i = e.currentTarget.dataset.i
      this.setData({
        ["show["+i+"]"]:!this.data.show[i]
      })
      console.log(this.data.show)
    },
    del(that, id) {
      api.delBills(id).then((res) => {
        this.triggerEvent('refresh');
        wx.showToast({
          title: '删除成功',
          duration: 1000
        })
      }).catch((errMsg) => {
        console.log(errMsg);
        wx.showToast({
          title: errMsg,
          duration: 1000
        })
      });
    },
    handleModify(e) {
      let {createAt,list,getWeek, date, notes, money, type, iconSelected} = e.target.dataset.item;
      let i = e.target.dataset.i;
      let time = e.target.dataset.time;
      wx.navigateTo({
        url: './../addition/addition?route=pages/bill/bill&data=' + JSON.stringify({
          i,
          createAt,
          getWeek,
          date,
          notes,
          money,
          type,
          iconSelected
        })
      });
    }
  }
});
