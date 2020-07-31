// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:"hainanu-3ozvd"
})
const db = cloud.database({
  env: 'hainanu-3ozvd'
})
// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection(event.database).doc(event.id).update({
    data: {
      like: event.like
    }
  })
}