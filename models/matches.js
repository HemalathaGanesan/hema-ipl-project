const mongoose=require('mongoose');
const Schema=mongoose.Schema;
var matches=new Schema({
    id:Number,
    season:Number,    
    team1:String,
});
const match=mongoose.model('match-data',matches);
module.exports=match;