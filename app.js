var express = require("express");
var app = express();
const routes = require("./routers/api");
const path = require("path");
require("./dbconnection");
app.use("/api", routes);
app.use("/", express.static(path.join(__dirname, "/webapp")));
app.listen(4002, () => console.log("sever started...!!"));
