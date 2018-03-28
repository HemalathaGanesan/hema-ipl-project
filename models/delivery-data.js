const mongoose=require('mongoose');
const Schema=mongoose.Schema;
var deliveries=new Schema({
    id:Number,
    season:Number,    
    team1:String,   
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
},{ collection : 'deliverymatch' });
const deliv_data=mongoose.model('deliverymatch',deliveries);
module.exports=deliv_data;