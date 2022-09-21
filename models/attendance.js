const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  details: [
    {
      startTime: { type: Date },
      endTime: { type: Date },
      workplace: { type: String, required: true },
    },
  ],
  isComfirmed: { type: String },
});

//#region  // Tạo statics thiết lập mảng các tháng đã làm từ ngày vào công ty đến hiện tại
attendanceSchema.statics.attendanceMonthRange = function (
  startDate,
  endDate,
  steps = 1
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
//#endregion

//#region  //Tạo statics thiết lập mảng các ngày từ fromDate đến toDdate có bao gồm cả thứ 7, chủ nhật
attendanceSchema.statics.workingRange = function (fromDate, toDate, steps = 1) {
  const workingArray = [];
  let currentDate = new Date(fromDate);
  while (currentDate <= new Date(toDate)) {
    workingArray.push(new Date(currentDate));
    currentDate.setUTCDate(currentDate.getUTCDate() + steps);
  }
  return workingArray;
};
//#endregion

//#region  // Tạo statics tính tổng giờ làm của một ngày
attendanceSchema.statics.calcTotalWorkingHour = function (startTime, endTime) {
  let totalWorkingHour = 0;
  if (endTime && startTime) {
    const sessionWorkingHour = ((endTime - startTime) / 3.6e6).toFixed(1);
    totalWorkingHour += parseFloat(sessionWorkingHour);
  }
  return totalWorkingHour;
};
//#endregion

module.exports = mongoose.model("Attendance", attendanceSchema);
