// const delivery=require('./models/deliveries')
const match=require('./models/matches')
const csvFilePath='./matches.csv'
const csv=require('csvtojson')
require('./dbconnection')
csv()
.fromFile(csvFilePath)
.on('json',(jsonObj)=>{
    match.create(jsonObj).then((res)=>{
        console.log(res)
    })
})
.on('done',(error)=>{
    console.log('file saved')
})




