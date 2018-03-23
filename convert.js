var fs = require('fs');
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var json; 
converter.fromFile("./matches.csv",function(err,result){
    
    if(err){
        console.log("An Error Has Occured");
        console.log(err);  
    } 
    
     json = result;
    fs.writeFile("matches.json",JSON.stringify(json),function(err,result){
        if(err){
        console.log("An Error Has Occured");
        console.log(err); 
        }
       
    })
    
    //console.log(json);
});