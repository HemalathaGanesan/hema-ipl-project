var express=require('express');
const router=express.Router();
const obj=require('../schemaa/match-schema');
const deliv=require('../schemaa/delivery-schema');
const player=require('../schemaa/players');
require('../database/connection.js')
var resl=[];


///getting unique seasons
router.get('/getSeason',function(req,res){
    obj.distinct("season").then(function(result){
    res.send(result.sort());
   });    
          
  });

  //getting seasonwise unique teams
  router.get('/getteam/:season',function(req,res){
    obj.find({season:req.params.season}).distinct("team1").then((data)=>{
      res.send(data);
    });
    });

    

    router.get('/getplayer/:season/:team',function(req,res){
      var obj={}
      obj[req.params.season]=req.params.team;
      console.log(obj)
      player.find({teams:obj}).then((data)=>{
       
        var playdata={};
        data.forEach((ele)=>{
          
           playdata[ele.name]=ele.Stats[req.params.season]
          
        })
      
        res.send(playdata)
      })
    })

router.get('/getbow/:season/:team',function(req,res){
  deliv.aggregate([
    {
      $lookup:
             {
           from: "match",
           localField: "match_id",
           foreignField: "id",
           as: "AllData"
                 
            }
      },
        {
          $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$AllData", 0 ] }, "$$ROOT" ] } }
        },
       
       {
           $project: { AllData: 0 }
          
       },
                      
                    
       {
           $group:
             {
                 _id:{
                     bowler:"$bowler",
                     match_id:"$match_id",                 
                     season:"$season"
                     },
                     totalrun:{$sum:"$total_runs"},
                     count:{$sum:{$cond:{if:{$eq:["$extra_runs",0]},then:1,else:0}}},
                     wickets:{$sum:{$cond:{if:{$and:[{$ne:["$dismissal_kind",""]},{$ne:["dismissal_kind","run out"]}]},then:1,else:0}}}
                  
     
              }
        },
        
        
         {
           $group:
             {
                 _id:{
                     bowler:"$_id.bowler",
                     season:"$_id.season"
                     },
                     totalruns:{$push:"$totalrun"},
                     counts:{$push:"$count"} ,
                     wicket:{$sum:"$wickets"}     
                   
             }
           
       },  
        
       {
           $project: {           
                 
                econy:{ $multiply:[{ $divide: [ {$sum:"$totalruns"}, {$sum:"$counts"} ] },6] },          
                wicket:1
               }
       }
           
         
         
    ]).then((ans)=>{
      var obj={}
      ans.forEach(ele => {
        if (obj.hasOwnProperty(ele._id.bowler)) {
         
            obj[ele._id.bowler][ele._id.season] = {};
           obj[ele._id.bowler][ele._id.season]["economy"]=ele.econy
            obj[ele._id.bowler][ele._id.season]["wicket"] = ele.wicket

          
        } else {
          obj[ele._id.bowler] = {};
          obj[ele._id.bowler][ele._id.season] = {};
          
          obj[ele._id.bowler][ele._id.season]["economy"]=ele.econy
          obj[ele._id.bowler][ele._id.season]["wicket"] = ele.wicket

        }
      });
      saveToSchema(obj)
      res.send(obj);
    })  
    
    
    
})

function saveToSchema(playerData){
  for(var i in playerData)
  {
    player.update({name:i,Bowling_stats:playerData[i]}).then((res)=>{
        console.log(i +'is created')
   })
  }   
}

   
  
          
  
  
  






module.exports=router;