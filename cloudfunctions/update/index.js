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
  var student = {}
  var students = []
  var minutes = 0
  var hour = 0
  var time = new Date()
  var r =  await db.collection("classroom").doc(event.id).get({
  })
      day = r.data.assignment.during.time.getDate()
      minutes = r.data.assignment.during.time.getMinutes()
      hour = r.data.assignment.during.time.getHours()
      if (minutes + r.data.assignment.during.during > 60) {
        hour = hour + 1
        minutes = minutes + r.data.assignment.during.during - 60
        if(hour>24)
        {
          hour = hour - 24
          day = day + 1
        }
      }
      else{
        minutes = minutes + r.data.assignment.during.during 
      }
      if(day > time.getDate()){
        for (var i in r.data.students) {
          if (event.student_id == r.data.students[i].id) {
            student = r.data.students[i]
            student.local = true
            students.push(student)
          }
          else {
            students.push(r.data.students[i])
          }
        }
        var res =  await db.collection("classroom").doc(event.id).update({
          data: {
            students: students
          }      
        })
      }else{
        if (day == time.getDate())
        {
          if (hour >= time.getHours()) {
            if (hour == time.getHours()) {
              if (minutes >= time.getMinutes()) {
                for (var i in r.data.students) {
                  if (event.student_id == r.data.students[i].id) {
                    student = r.data.students[i]
                    student.local = true
                    students.push(student)
                  }
                  else {
                    students.push(r.data.students[i])
                  }
                }
               var res =  await db.collection("classroom").doc(event.id).update({
                  data: {
                    students: students
                  }
                })
              }
              else {
                return "" + day +"-"+ hour + ":" + minutes + "and" + time.getDate()+"-" +time.getHours() + ":" + time.getMinutes()
              }
            }
            else {
              for (var i in r.data.students) {
                if (event.student_id == r.data.students[i].id) {
                  student = r.data.students[i]
                  student.local = true
                  students.push(student)
                }
                else {
                  students.push(r.data.students[i])
                }
              }

             var res =  await db.collection("classroom").doc(event.id).update({
                data: {
                  students: students
                }
              })
            }
          }
          else {
            return "" + day + "-" + hour + ":" + minutes + "and" + time.getDate() + "-" + time.getHours() + ":" + time.getMinutes()
          }
        }
      }
  if (res.stats.updated == 1)
  {
    return true
  }
  else{
    return "" + day + "-" + hour + ":" + minutes + "and" + time.getDate() + "-" + time.getHours() + ":" + time.getMinutes()
  }
}