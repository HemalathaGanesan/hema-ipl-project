var express=require('express');
var app=express();
const routes=require('./routes/api')
const path=require('path')
require('./database/connection');
app.use('/api',routes);
app.use('/',express.static(path.join(__dirname,'/webapp')));


app.listen(7000,()=> console.log("sever started...!!"));

