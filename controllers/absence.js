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

  User.updateOne({ userId: req.user._id });
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
