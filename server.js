const mocha=require('mocha');
const del=require('./schemaa/delivery-schema')
const match=require('./schemaa/match-schema')
const csvFilePath='./matches.csv'
const csv=require('csvtojson')
require('./database/connection')
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




