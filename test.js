

const deliv = require("./schemaa/delivery-schema");
const playersSchema = require("./schemaa/players");
const matches = require("./schemaa/match-schema");
var play=[];
require("./database/connection.js");
// getBatsManData();
function getBatsManData() {
  deliv
    .aggregate([
      {
        $lookup: {
          from: "match",
          localField: "match_id",
          foreignField: "id",
          as: "AllData"
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ["$AllData", 0] }, "$$ROOT"]
          }
        }
      },

      {
        $project: { AllData: 0 }
      },
      {
        $group: {
          _id: {
           // bowler:"$bowler",
            batsman: "$batsman",
            match_id: "$match_id",
            season: "$season",
            team:"$batting_team"
          },
          batsmanRun: { $sum: "$batsman_runs" },
          balls: { $sum: 1 },
          // totalrun:{$sum:"$total_runs"},
          // count:{$sum:{$cond:{if:{$eq:["$extra_runs",0]},then:1,else:0}}},
         wickets:{$sum:{$cond:{if:{$and:[{$ne:["$dismissal_kind",""]},{$ne:["dismissal_kind","run out"]}]},then:1,else:0}}}
          
        }
      },
      {
        $group: {
          _id: {
            batsman: "$_id.batsman",
            season: "$_id.season",
            // bowler:"$_id.bowler",
            team:"$id.team"
          },
          batsmanRuns: { $push: "$batsmanRun" },
          ball: { $push: "$balls" },
         // match: { $sum: "$matches" },
        //  totalruns:{$sum:"$totalrun"},
        //  counts:{$push:"$count"} ,
         wicket:{$sum:"$wickets"}
        }
      },
      {
        $project: {          
          team:"$id.team",
          runs: { $sum: "$batsmanRuns" },
          HighScore: { $max: "$batsmanRuns" },
          Average: { $avg: "$batsmanRuns" },
          striRate: {$multiply: [{ $divide: [{ $sum: "$batsmanRuns" }, { $sum: "$ball" }] },100]},
          // totalruns:1,
          wicket:1
        }
      }
    ])
    .then(data => {
    //  console.log(data)
      var obj = {};
      data.forEach(ele => {
        
        if (obj.hasOwnProperty(ele._id.batsman)) {
         
            obj[ele._id.batsman][ele._id.season] = {};
            obj[ele._id.batsman][ele._id.season]["runs"] = ele.runs;
            obj[ele._id.batsman][ele._id.season]["HighScore"]=ele.HighScore
            obj[ele._id.batsman][ele._id.season]["Average"]=ele.Average
            obj[ele._id.batsman][ele._id.season]["striRate"]=ele.striRate
            // obj[ele._id.batsman][ele._id.season]["totalruns"]=ele.totalruns
            obj[ele._id.batsman][ele._id.season]["wicket"] = ele.wicket

          
        } else {
          obj[ele._id.batsman] = {};
          obj[ele._id.batsman][ele._id.season] = {};
          obj[ele._id.batsman][ele._id.season]["runs"] =ele.runs;
          obj[ele._id.batsman][ele._id.season]["HighScore"]=ele.HighScore
          obj[ele._id.batsman][ele._id.season]["Average"]=ele.Average
          obj[ele._id.batsman][ele._id.season]["striRate"]=ele.striRate
          // obj[ele._id.batsman][ele._id.season]["totalruns"]=ele.totalruns
          obj[ele._id.batsman][ele._id.season]["wicket"] = ele.wicket

        }
      });
      // console.log("obj");
      saveToSchema(obj);

    });
}
//saveToSchema()
function saveToSchema(playerData){
  
    for(var i in playerData)
    {   
     var obj={}
    // obj["Stats"]=playerData[i]
     playersSchema.create({name:i,Stats:playerData[i]}).then((res)=>{
           console.log(i +'is created')
     })
   }
    
    
  

  
}

////getting unique players 
// players()
function players(){
    
    deliv.distinct("batsman").then((bat)=>{
   deliv.distinct("bowler").then((bow)=>{
      var arr=bat.concat(bow)  
      //console.log(arr) 
      arr.forEach((e,index)=>{
     if(play.indexOf(e)===-1){
         play.push(e);
     }
      })
      //console.log(play.length)
      play.forEach((ele)=>{
        playersSchema.create({name:ele}).then((res)=>{
      console.log(res)
        })
      })
      
})
})
}




updatePlayerSeason()
function updatePlayerSeason(){
    matches.distinct("season").then((season) => {
        season.sort((a, b) => (a - b))
        season.forEach((year) => {
            matches.find({ season: year }, { id: 1 }).then((match_id) => {
     
            const id = match_id.map((ele) => ele.id).sort((a, b) => (a - b))
            //console.log(id)
            deliv.find({ match_id: { $gte: id[0], $lte: id[id.length - 1] } }).then((del) => {
            
                playersSchema.distinct("name").then((player) => {
                 
                  player.forEach((p) => {
                    var flag=true
                 del.forEach((d)=>{
                   if(flag)
                   {
                  if (d.batsman===p) {
                    flag=false;
                    var obj={}
                    obj[year]={}
                    obj[year]["team"]=d.batting_team
                    playersSchema.update({ name: p }, { $push: { teams: { [year]:d.batting_team }}} ).then((res) => {
                      console.log(res)
                     
                    })
                  }
                //   else if (d.bowler===p) {
                //     flag=false;
                //     player.update({ name: p }, { $push: { teams: {[year]:d.bowling_team} } }).then((res) => {
                //       console.log(res)
                     
                //     })
                //   }
                }
     
                 })
                    
                  })
                
              })
            })
          })
     
        })
      }).catch((err) => {
        console.log(err)
      })

}