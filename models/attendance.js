const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Model
const attendanceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  details: [
    {
      startTime: { type: Date },
      endTime: { type: Date },
      workplace: { type: String, required: true },
    },
  ],
});

// Tạo statics thiết lập mảng các tháng đã làm từ ngày vào công ty đến hiện tại
attendanceSchema.statics.attendanceMonthRange = function (
  startDate,
  endDate,
  steps = 10
) {
  const monthArray = [];
  let currentDate = new Date(startDate);
  while (currentDate <= new Date(endDate)) {
    const mmYyyy = `${new Date(currentDate).getUTCMonth() + 1}/${new Date(
      currentDate
    ).getUTCFullYear()}`;
    if (!monthArray.filter((x) => x === mmYyyy).length) {
      monthArray.push(mmYyyy);
    }
    currentDate.setUTCDate(currentDate.getUTCDate() + steps);
  }
  return monthArray;
};

//Tạo statics liệt kê các ngày từ ngày bắt đầu vào công ty đến hiện tại ngoại trừ thứ 7, chủ nhật
attendanceSchema.statics.attendanceWorkingRange = function (
  startDate,
  endDate,
  steps = 1
) {
  const dateArray = [];
  let currentDate = new Date(startDate);
  while (currentDate <= new Date(endDate)) {
    if (currentDate.getUTCDay() >= 1 && currentDate.getUTCDay() <= 5) {
      dateArray.push(new Date(currentDate));
    }
    currentDate.setUTCDate(currentDate.getUTCDate() + steps);
  }
  return dateArray;
};

//Tạo statics liệt kê các ngày từ ngày bắt đầu vào công ty đến hiện tại có bao gồm cả thứ 7, chủ nhật
attendanceSchema.statics.workingRange = function (startDate, today, steps = 1) {
  const workingArray = [];
  let currentDate = new Date(startDate);
  while (currentDate <= new Date(today)) {
    workingArray.push(new Date(currentDate));
    currentDate.setUTCDate(currentDate.getUTCDate() + steps);
  }
  return workingArray;
};

// Tạo statics tính tổng giờ làm của một ngày
attendanceSchema.statics.calcTotalWorkingHour = function (startTime, endTime) {
  let totalWorkingHour = 0;
  if (endTime && startTime) {
    const sessionWorkingHour = ((endTime - startTime) / 3.6e6).toFixed(1);
    totalWorkingHour += parseFloat(sessionWorkingHour);
  }
  return totalWorkingHour;
};

module.exports = mongoose.model("Attendance", attendanceSchema);
