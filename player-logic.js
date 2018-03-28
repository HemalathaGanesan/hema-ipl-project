const deliv_data=require('./models/deliveries')
// const match=require('./models/matches')
const deliverymatches=require('./models/delivery-data')

require("./dbconnection");

// mergedata()
function mergedata(){
  deliv_data.aggregate([
    {
      $lookup: {
        from: "match-datas",
        localField: "match_id",
        foreignField: "id",
        as: "deliverymatch"
      }
    },
    {
      $replaceRoot: {newRoot: {$mergeObjects: [{ $arrayElemAt: ["$deliverymatch", 0] }, "$$ROOT"]}}
    },

    {
      $project: { deliverymatch: 0,match_id:0 }      
    },
    {
        $out:"deliverymatch"
    }
]).then((data)=>{
console.log(data)
})
}
///////////////////////////////////////////////////////////////////////////////////////////////

getbatsmandata()
function getbatsmandata(){

  deliverymatches.aggregate([
    {
    $group:{
        _id:{
        season:"$season",
        name:"$batsman",
        team:"$battiing_team",
         id:"$id"   
        },
       
        batsmanRun:{$sum:"$batsman_runs"},
        balls:{$sum:1},
        
    }
    },
    {
     $group:{
         _id: {
                batsman: "$_id.name",
                season: "$_id.season",
                teams:"$__id.team"
              },
              batsmanRuns: { $push: "$batsmanRun" },
              ball: { $push: "$balls" },
              Thirties:{$sum:{$cond:{if:{$and:[{$lt:["$batsmanRun",50]},{$gte:["$batsmanRun",30]}]},then:1,else:0}}}
    
    
         }   
     },
    
    {
        $project:{
            
              Runs: { $sum: "$batsmanRuns" },
              HighScore: { $max: "$batsmanRuns" },
              Average: { $avg: "$batsmanRuns" },
              StriRate: {$multiply: [{ $divide: [{ $sum: "$batsmanRuns" }, { $sum: "$ball" }] },100]},
              Thirties:1
              
    }
    }
  ])
  .then((res)=>{
  console.log(res)
  })   
    
}


