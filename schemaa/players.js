const mongoose=require('mongoose');
const Schema=mongoose.Schema;
var players=new Schema({
    name:String,
     Stats:Object,
    // Bowling_stats:Object,
    teams:Array
},{collection:'player'});
var testplay=mongoose.model('player',players);
module.exports=testplay;