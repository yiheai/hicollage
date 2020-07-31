// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: "hainanu-3ozvd"
})
const db = cloud.database({
  env: 'hainanu-3ozvd'
})
// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection("topic").doc(event.id).update({
    data: {
      talk:db.command.addToSet({
       content: event.talk,
        user: event.user,
        time: event.date,
      })
    }
  })
}