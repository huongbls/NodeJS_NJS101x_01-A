const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Employee = require("./Employee");

// Tao model
const checkInSchema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
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

module.exports = mongoose.model("check-in", checkInSchema);
