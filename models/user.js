const mongoose = require("mongoose");
const Attendance = require("./attendance");
const Absence = require("./absence");
const Schema = mongoose.Schema;

// Create Schema
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  dob: { type: Date, required: true },
  salaryScale: { type: Number, required: true },
  startDate: { type: Date, required: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  annualLeave: { type: Number, required: true },
  image: { type: String, required: true },
  gender: { type: String, required: true },
  isAdmin: { type: String, required: true },
  isWorking: { type: Boolean, default: false },
  workplace: { type: String },
  isLocked: { type: String, default: false },
  visitedPath: { type: String, default: "/" },
});

//#region  // Method tạo mảng statistics chứa các object bao gồm các ngày từ ngày vào công ty,
// đến ngày cuối cùng của năm hiện tại. Nếu có các thông tin giờ làm việc, nghỉ phép tương ứng các ngày
//thì sẽ được thêm vào object.
userSchema.methods.getStatistic = function () {
  let statistics = [];
  const today = new Date();
  const firstDayOfNextYear = new Date(today.getFullYear(), 12, 0);
  const dateArr = Attendance.workingRange(
    this.startDate,
    firstDayOfNextYear,
    1
  );
  dateArr.forEach((date) => {
    statistics.push({ date: date });
  });
  return Absence.find({ userId: this._id })
    .lean()
    .then((absences) => {
      absences.forEach((absence) => {
        absence.registerLeave.forEach((leave) => {
          statistics.forEach((object) => {
            if (
              object.date.toLocaleDateString() ===
              leave.fromDate.toLocaleDateString()
            ) {
              const leaveHour = Absence.absenceCountHour(
                leave.fromHour,
                leave.toHour
              );
              Object.assign(
                object,
                { leaveHour: leaveHour },
                { totalHour: leaveHour }
              );
            }
          });
        });
        return statistics;
      });

      return Attendance.find({ userId: this._id })
        .lean()
        .then((attendances) => {
          attendances.forEach((attendance) => {
            let totalWorkingHour = 0;
            if (attendance) {
              attendance.details.forEach((item) => {
                totalWorkingHour += Attendance.calcTotalWorkingHour(
                  item.startTime,
                  item.endTime
                );
              });
            }
            statistics.forEach((object) => {
              if (
                object.date.toLocaleDateString() ===
                attendance.date.toLocaleDateString()
              ) {
                const leaveHour = object.leaveHour;
                Object.assign(
                  object,
                  { details: attendance.details },
                  { totalWorkingHour: totalWorkingHour },
                  {
                    totalHour: leaveHour
                      ? totalWorkingHour + leaveHour
                      : totalWorkingHour,
                  },
                  {
                    overTime: leaveHour
                      ? Math.max(
                          (totalWorkingHour + leaveHour - 8).toFixed(1),
                          0
                        )
                      : Math.max((totalWorkingHour - 8).toFixed(1), 0),
                  }
                );
              }
            });
          });
          statistics.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
          });
          return statistics;
        });
    })
    .catch((err) => console.log(err));
};
//#endregion

//#region  // Tạo method tính số ngày làm việc của tháng (không bao gồm thứ 7, chủ nhật)
userSchema.methods.getWorkingBussinessDay = function (year, month) {
  return new Array(32 - new Date(year, month, 32).getDate())
    .fill(1)
    .filter(
      (id, index) =>
        [0, 6].indexOf(new Date(year, month, index + 1).getDay()) === -1
    ).length;
};
//#endregion

//#region  //Methods tạo mảng chứa các tháng đã làm việc
userSchema.methods.getWorkingMonths = function () {
  let salaryStatistics = [];
  const monthArr = Attendance.attendanceMonthRange(
    this.startDate,
    new Date(),
    1
  );
  monthArr.forEach((month) => {
    salaryStatistics.push({ month: month });
  });
  return salaryStatistics;
};
//#endregion

module.exports = mongoose.model("User", userSchema);
