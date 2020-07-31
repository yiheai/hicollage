var rp = require('request-promise');
const cloud = require('wx-server-sdk') 
const sm2 = require('miniprogram-sm-crypto').sm2;
// 云函数入口函数
exports.main = async (event, context) => {
  var privateKey = "71a353026c1a694ec856b48e92532ae58c768369045cf1dd624fa297a0c2efe4";
  var data = {
    url: sm2.doDecrypt(event.url, privateKey, event.token),
    headers: {
      "token": event.token
    },
    json: true
  }
  return await rp(data)
    .then(function (res) {
      return res
    })
    .catch(function (err) {
      return '失败'
    });
}