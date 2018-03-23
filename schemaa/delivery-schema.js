const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const deliveries=new Schema({
    match_id:Number,
    inning:Number,
    batting_team:String,
    bowling_team:String,
    over:String,
    ball:Number,
    batsman:String,
    non_striker:String,
    bowler:String,
    is_super_over:String,
    wide_runs:String,
    bye_runs:String,
    legbye_runs:Number,
    noball_runs: String,  
    penalty_runs:String,
    batsman_runs:Number,
    extra_runs:Number,
    total_runs:Number,
    player_dismissed:String,
    dismissal_kind:String,
    fielder:String    
},{collection:'delivery-data'});
const deliver=mongoose.model('delivery-data',deliveries);
module.exports=deliver;