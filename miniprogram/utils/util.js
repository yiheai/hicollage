/**
* 格式化时间 
* @param {String} date 原始时间格式
* 格式后的时间：yyyy/mm/dd hh:mm:ss
**/
const formatTime = (date) => {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const formatDate = (time) => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join('/')
};
/**
 * 获得年
 */
const getYear = () => new Date().getFullYear();
/**
 * 获得月
 */
const getMonth = () => {
  var m = new Date().getMonth() + 1;
  return m > 10 ? m : "0" + m;
}

/**
 * 获得当前日期
 */
const getDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join('/')
}

/**
 * 获得礼拜几
 */
const getWeek = (d) => {
  let date;
  if (d) {
    date = new Date(d);
  } else {
    date = new Date();
  }
  var weekday = new Array(7)
  weekday[0] = "周日"
  weekday[1] = "周一"
  weekday[2] = "周二"
  weekday[3] = "周三"
  weekday[4] = "周四"
  weekday[5] = "周五"
  weekday[6] = "周六"
  return weekday[date.getDay()];
}
/**
 * 降序函数
 * @param a
 * @param b
 * @returns {number}
 */
function desc(a, b) {
  return b - a;
}


module.exports = {
  formatTime: formatTime,
  getWeek: getWeek,
  getYear,
  getMonth,
  desc,
  getDate,
  formatDate,
}
