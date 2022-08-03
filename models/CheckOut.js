const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Tao model
const checkOutSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  workingPlace: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("check-out", checkOutSchema);
