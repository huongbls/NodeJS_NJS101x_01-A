const Absence = require("../models/absence");
const User = require("../models/user");

// GET Absence Page
exports.getAbsence = (req, res, next) => {
  Absence.findOne({ userId: req.session.user._id })
    .lean()
    .then((result) => {
      if (!result) {
        const newAbsence = new Absence({
          userId: req.session.user._id,
          registerLeave: [],
        });
        return newAbsence.save();
      }
      return result;
    })
    .then((absence) => {
      res.render("absence", {
        pageTitle: "Đăng ký nghỉ",
        user: req.session.user,
        absence: absence,
        active: { timesheet: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// Post Absence Details Page
exports.postAbsence = (req, res, next) => {
  const absenceDateArr = Absence.absenceDateRange(
    req.body.fromDate,
    req.body.toDate,
    1
  );
  const countHours = Absence.absenceCountHour(
    req.body.fromHour,
    req.body.toHour
  );
  // Tính số ngày đăng ký nghỉ = só ngày (ko bao gồm thứ 7, cn)* số giờ /8
  const dayLeaveRequest = ((absenceDateArr.length * countHours) / 8).toFixed(1);
  const annualLeave = req.session.user.annualLeave;
  const daysRemain = annualLeave - dayLeaveRequest;

  Absence.findOne({ userId: req.session.user._id })
    .then((absence) => {
      absenceDateArr.forEach((date) => {
        absence.registerLeave.push({
          fromDate: date,
          toDate: date,
          hours: countHours,
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

  // Update số ngày nghỉ còn lại
  User.updateOne({ annualLeave: daysRemain }, function (err, res) {
    if (err) throw err;
    console.log(res);
  });
};

// Get Absence Details Page
exports.getAbsenceDetails = (req, res, next) => {
  console.log(req.session.user._id);
  console.log(req.session.user);
  Absence.findOne({ userId: req.session.user._id })
    .lean()
    .then((absence) => {
      return absence;
    })
    .then((absence) => {
      res.render("absence-details", {
        pageTitle: "Nghỉ phép",
        user: req.session.user,
        absence: absence,
        active: { timesheet: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};
