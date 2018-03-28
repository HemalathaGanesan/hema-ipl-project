const mongoose=require('mongoose');
const Schema=mongoose.Schema;
var delivery=new Schema({
    match_id:Number,    
    batting_team:String,
    bowling_team:String,    
    ball:Number,
    batsman:String,   
    bowler:String,   
    noball_runs: String,    
    batsman_runs:Number,
    extra_runs:Number,
    total_runs:Number,   
    dismissal_kind:String  
});
const deliveries=mongoose.model('delivery-data',delivery);
module.exports=deliveries;