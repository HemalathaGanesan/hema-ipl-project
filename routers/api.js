var express = require("express");
const router = express.Router();
const deliv_data = require("../models/deliveries");
const deliverymatches = require("../models/delivery-data");
require("../dbconnection");
var player_datas = {};

///getting unique seasons
router.get("/season", function(req, res) {
  getSeason().then(function(season){
    // console.log(season)
    res.send(season.sort())
  })
}); 

function getSeason(){
 return deliverymatches.distinct("season")
}

////////////////////////////////////////////////////////////////////////////////////////

//getting seasonwise unique teams
router.get("/team/:season", function(req, res) {
  getTeam(req.params.season).then(team => {
      res.send(team);
    });
});

function getTeam(season){
  return deliverymatches.find({ season:season }).distinct("team1").then(function(team){
    return team
  })
}

//////////////////////////////////////////////////////////////////////////////////////

router.get("/player/:season/:team", function(req, res) {  
  getPlayers(req.params.season,req.params.team).then(function(player){
    // console.log(player)
    res.send(player);
  })    
})


function getPlayers(season,team){
  // console.log(typeof(season)) 
  return deliverymatches.find({ season: parseInt(season), batting_team: team }).distinct("batsman").then(batsman => {
  return deliverymatches.find({ season: parseInt(season), bowling_team: team }).distinct("bowler").then(bowler => {
    
       var players = batsman.concat(bowler).filter((play, index, arr) => {
        
          return (arr.indexOf(play) === index)
         
          
})
return players
})
}) 
}

////////////////////////////////////////////////////////////////////////////////////////////

function getBatsManData(season, player) {
  return deliverymatches
    .aggregate([
      {
        $match: {
          season: parseInt(season),
          batsman: player
        }
      },
      {
        $group: {
          _id: "batman_runs",
          batsmanRun: { $sum: "$batsman_runs" },
          balls: { $sum: 1 },
          Thirties: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $lt: ["$batsmanRun", 50] },
                    { $gte: ["$batsmanRun", 30] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      }
    ])
    .then(res => {
      if (res.length === 0) {
        res.push({ batsmanRun: 0, balls: 0, Thirties: 0 });
      }
      return res;
    });
}

function getMatchPlayed(season, player) {
  return deliverymatches
    .find({
      $and: [
        { season: season },
        { $or: [{ batsman: player }, { bowler: player }] }
      ]
    })
    .distinct("id")
    .then(data => {
      return data.length;
    });
}

function getBowlerData(season, player) {
  return deliverymatches
    .aggregate([
      {
        $match: {
          season: parseInt(season),
          batsman: player
        }
      },
      {
        $group: {
          _id: "bowler",
          totalrun: { $sum: "$total_runs" },
          balls: { $sum: 1 },
          wickets: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ["$dismissal_kind", ""] },
                    { $ne: ["dismissal_kind", "run out"] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      }
    ])
    .then(res => {
      if (res.length === 0) {
        res.push({ totalrun: 0, balls: 0, wickets: 0 });
      }
      return res;
    });
}

router.get("/players/:player", (req, res) => {
 console.log(req.query.season)
//  res.send(req.query)
  getBatsManData(req.query.season, req.params.player).then(batsmandata => {
    getMatchPlayed(req.query.season, req.params.player).then(matchdata => {
      getBowlerData(req.query.season, req.params.player).then(bowlerdata => {
        var player_details = {};
        (player_details["Name"] = req.params.player),
          (player_details["TotalRun"] = batsmandata[0].batsmanRun),
          (player_details["Average"] = (batsmandata[0].batsmanRun / matchdata).toFixed(2)),
          (player_details["StrikeRate"] = (batsmandata[0].batsmanRun /batsmandata[0].balls *100).toFixed(2)),
          (player_details["Thirites"] = batsmandata[0].Thirites || 0),
          (player_details["Wickets"] = bowlerdata[0].wickets),
          (player_details["Economy"] =(bowlerdata[0].totalrun / bowlerdata[0].balls * 6).toFixed(2) || 0);
        res.send(player_details);
      });
    });
  });
});

////////////////////////////////////////////////////////////////////////////////////////////

// mergedata()
function mergeData() {
  deliv_data
    .aggregate([
      {
        $lookup: {
          from: "match-datas",
          localField: "match_id",
          foreignField: "id",
          as: "deliverymatch"
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayElemAt: ["$deliverymatch", 0] }, "$$ROOT"]
          }
        }
      },

      {
        $project: { deliverymatch: 0, match_id: 0 }
      },
      {
        $out: "deliverymatch"
      }
    ])
    .then(data => {
      console.log(data);
    });
}

module.exports = router;
