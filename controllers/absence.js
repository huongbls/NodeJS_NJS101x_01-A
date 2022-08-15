const { data } = require("autoprefixer");
const Absence = require("../models/absence");
const User = require("../models/user");

function convertDateToUTC(date) {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}
// GET Absence Page
exports.getAbsence = (req, res, next) => {
  Absence.findOne({ userId: req.user._id })
    .lean()
    .then((absence) => {
      // Check if user has no absence data
      if (!absence) {
        const newAbsence = new Absence({
          userId: req.user._id,
          date: convertDateToUTC(new Date()),
          registerLeave: [],
        });
        return newAbsence.save();
      }
      return absence;
    })
    .then((absence) => {
      res.render("absence", {
        pageTitle: "Đăng ký nghỉ",
        user: req.user,
        absence: absence,
      });
    })
    .catch((err) => console.log(err));
};

const dateRange = function (startDate, endDate, steps = 1) {
  const dateArray = [];
  let currentDate = new Date(startDate);
  while (currentDate <= new Date(endDate)) {
    if (currentDate.getUTCDay() >= 1 && currentDate.getUTCDay() <= 5) {
      dateArray.push(new Date(currentDate));
    }
    // Use UTC date to prevent problems with time zones and DST
    currentDate.setUTCDate(currentDate.getUTCDate() + steps);
  }
  return dateArray;
};

// Post Absence Details Page
exports.postAbsence = (req, res, next) => {
  Absence.findOne({ userId: req.user._id })
    .then((absence) => {
      const dataArr = dateRange(req.body.fromDate, req.body.toDate, 1);
      dataArr.forEach((date) => {
        absence.registerLeave.push({
          fromDate: date,
          toDate: date,
          hours: req.body.hours,
          fromHour: req.body.fromHour,
          toHour: req.body.toHour,
          reason: req.body.reason,
        });
      });
      return absence.save();
    })
    .then((absence) => {
      res.redirect("/absence-details");
    })
    .catch((err) => console.log(err));

  const fromDate = req.body.fromDate;
  const toDate = req.body.toDate;
  const dateArr = dateRange(fromDate, toDate, 1);
  const fromHour = new Date(`1900-01-01 ${req.body.fromHour}`);
  const toHour = new Date(`1900-01-01 ${req.body.toHour}`);
  // Tính số giờ đăng ký nghỉ (trừ đi 1 tiếng nghỉ trưa từ 12h-13h)
  let countHours = 0;
  if (fromHour.getHours() <= 12 && toHour.getHours() >= 13) {
    countHours = (toHour - fromHour) / 3.6e6 - 1;
  } else {
    countHours = (toHour - fromHour) / 3.6e6; //1 hr = 3.6e6 ms
  }
  // Tính số ngày đăng ký nghỉ = só ngày (ko bao gồm thứ 7, cn)* số giờ /8
  const dayLeaveRequest = ((dateArr.length * countHours) / 8).toFixed(1);
  const annualLeave = req.user.annualLeave;
  const daysRemain = annualLeave - dayLeaveRequest;
  // Update số ngày nghỉ còn lại
  User.updateOne({ annualLeave: daysRemain }, function (err, res) {
    if (err) throw err;
    //update thành công
    console.log(res);
    //trả về document đã cập nhật.
  });
};

// Get Absence Details Page
exports.getAbsenceDetails = (req, res, next) => {
  // Get Absence Details by User
  Absence.findOne({ userId: req.user._id })
    .lean()
    .then((absence) => {
      return absence;
    })
    .then((absence) => {
      res.render("absence-details", {
        pageTitle: "Nghỉ phép",
        user: req.user,
        absence: absence,
      });
    })
    .catch((err) => console.log(err));
};
