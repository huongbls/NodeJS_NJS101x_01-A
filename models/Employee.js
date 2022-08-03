const mongoose = require("mongoose");

const Schema = mongoose.Schema; //schema: lược đồ

const employeeSchema = new Schema({
  staffId: { type: String, required: true },
  fullname: { type: String, required: true },
  doB: { type: String, required: true },
  startDate: { type: String, required: true },
  salaryScale: { type: Number, required: true },
  department: { type: String, required: true },
  annualLeave: { type: Number, required: true },
  imageUrl: { type: String, required: true },
});

module.exports = mongoose.model("Employee", employeeSchema);
