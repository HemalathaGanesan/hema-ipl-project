const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/ipl");
mongoose.connection
  .once("open", function() {
    console.log("connection successfuily made...!!");
  })
  .on("error", function(error) {
    console.log(error);
  });
