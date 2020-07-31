// 云函数入口文件
const cloud = require('wx-server-sdk')
const sm2 = require('miniprogram-sm-crypto').sm2;
cloud.init({
  env: "hainanu-3ozvd"
})
const db = cloud.database({
  env: 'hainanu-3ozvd'
})
// 云函数入口函数
exports.main = async (event, context) => {
  var privateKey = "71a353026c1a694ec856b48e92532ae58c768369045cf1dd624fa297a0c2efe4";
  return await db.collection('classroom').doc(event.id).update({
    data: {
      students: db.command.push(sm2.doDecrypt(event.students, privateKey, event.id))
    } 
  })
}