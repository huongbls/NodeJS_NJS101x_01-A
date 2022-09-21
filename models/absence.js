const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const absenceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  registerLeave: [
    {
      fromDate: {
        type: Date,
        required: true,
        // unique: true,
      },
      toDate: {
        type: Date,
        required: true,
        // unique: true,
      },
      hours: {
        type: Number,
        required: true,
      },
      fromHour: {
        type: String,
        required: true,
      },
      toHour: {
        type: String,
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
      isConfirmed: {
        type: String,
      },
    },
  ],
});

//#region //Tạo statics trả về mảng các nghỉ ngày nghỉ phép dựa trên startDate, endDate (không bao gồm thứ 7, chủ nhật)
absenceSchema.statics.absenceDateRange = function (
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
//#endregion

//#region  //Tạo statics trả về số giờ nghỉ trong ngày (không bao gồm giờ nghỉ trưa)
absenceSchema.statics.absenceCountHour = function (fromTime, toTime) {
  const fromHour = new Date(`1900-01-01 ${fromTime}`);
  const toHour = new Date(`1900-01-01 ${toTime}`);
  // Tính số giờ đăng ký nghỉ (trừ đi 1 tiếng nghỉ trưa từ 12h-13h)
  let countHours = 0;
  if (fromHour.getHours() <= 12 && toHour.getHours() >= 13) {
    countHours = (toHour - fromHour) / 3.6e6 - 1;
  } else {
    countHours = (toHour - fromHour) / 3.6e6; //1 hr = 3.6e6 ms
  }
  return countHours;
};
//#endregion

module.exports = mongoose.model("Absence", absenceSchema);
