const Absence = require("../models/absence");
const User = require("../models/user");

// GET Absence Page
exports.getAbsence = (req, res, next) => {
  Absence.findOne({ userId: req.user._id })
    .lean()
    .then((absence) => {
      // Check if user has no absence data
      if (!absence) {
        const newAbsence = new Absence({
          userId: req.user._id,
          date: new Date(),
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

// Post Absence Details Page
exports.postAbsence = (req, res, next) => {
  Absence.findOne({ userId: req.user._id })
    .then((absence) => {
      console.log(absence);
      absence.registerLeave.push({
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
        hours: req.body.hours,
        reason: req.body.reason,
      });
      return absence.save();
    })
    .then((absence) => {
      res.redirect("/absence-details");
    })
    .catch((err) => console.log(err));

  const fromDate = new Date(req.body.fromDate);
  const toDate = new Date(req.body.toDate);
  const hours = req.body.hours;
  const dayLeaveRequest =
    ((Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1) * hours) / 8;
  const annualLeave = req.user.annualLeave;
  const daysRemain = annualLeave - dayLeaveRequest;

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
