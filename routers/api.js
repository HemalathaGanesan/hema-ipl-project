var express = require("express");
const router = express.Router();
const deliv_data = require("../models/deliveries");
const deliverymatches = require("../models/delivery-data");
require("../dbconnection");
var player_datas = {};

///getting unique seasons
router.get("/season", function(req, res) {
  deliverymatches.distinct("season").then(function(result) {
    res.send(result.sort());
  });
});
////////////////////////////////////////////////////////////////////////////////////////

//getting seasonwise unique teams
router.get("/team/:season", function(req, res) {
  deliverymatches
    .find({ season: req.params.season })
    .distinct("team1")
    .then(data => {
      res.send(data);
    });
});

//////////////////////////////////////////////////////////////////////////////////////

router.get("/player/:season/:team", function(req, res) {
  deliverymatches
    .find({ season: req.params.season, batting_team: req.params.team })
    .distinct("batsman")
    .then(batsman => {
      deliverymatches
        .find({ season: req.params.season, bowling_team: req.params.team })
        .distinct("bowler")
        .then(bowler => {
          var players = batsman.concat(bowler).filter((play, index, arr) => {
            return arr.indexOf(play) === index;
          });
          res.send(players);
        });
    });
});

////////////////////////////////////////////////////////////////////////////////////////////

function getbatsmandata(season, player) {
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

function getmatchplayed(season, player) {
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

function getbowlerdata(season, player) {
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

router.get("/players/:season/:team/:player", (req, res) => {
  getbatsmandata(req.params.season, req.params.player).then(batsmandata => {
    getmatchplayed(req.params.season, req.params.player).then(matchdata => {
      getbowlerdata(req.params.season, req.params.player).then(bowlerdata => {
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
function mergedata() {
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
