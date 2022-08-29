const mongoose = require("mongoose");

exports.mongooseConnect = () => {
  return mongoose.connect(
    "mongodb+srv://huong:OiFcLLuMsc9aIYBh@asm1.7szamyk.mongodb.net/test"
  );
};

// "mongodb+srv://huong:OiFcLLuMsc9aIYBh@asm1.7szamyk.mongodb.net/?retryWrites=true&w=majority"
