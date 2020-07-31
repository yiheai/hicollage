var rp = require('request-promise');
const cloud = require('wx-server-sdk') 
const privateKey = "71a353026c1a694ec856b48e92532ae58c768369045cf1dd624fa297a0c2efe4";
cloud.init({
  env: "hainanu-3ozvd"
})
const sm2 = require('miniprogram-sm-crypto').sm2;
const db = cloud.database({
  env: 'hainanu-3ozvd'
})
// 云函数入口函数
exports.main = async (event, context) => {
  if (event.id!=undefined){
    var r = await db.collection('user').doc(event.id).get()
    var pwd = sm2.doDecrypt(r.data.student_pwd, privateKey, r.data.student_id + r.data.message.xm)
    let url = sm2.doDecrypt(event.url, privateKey, 'login') + pwd;
    return await rp(url)
      .then(function (res) {
        return res
      })
      .catch(function (err) {
        return '失败'
      });
  }else{
    let url = sm2.doDecrypt(event.url, privateKey, 'login');
    return await rp(url)
      .then(function (res) {
        return res
      })
      .catch(function (err) {
        return '失败'
      });
  }

}