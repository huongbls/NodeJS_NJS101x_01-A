const Absence = require("../models/absence");
const User = require("../models/user");

// GET Absence Page
exports.getAbsence = (req, res, next) => {
  Absence.findOne({ userId: req.user._id })
    .lean()
    .then((result) => {
      if (!result) {
        const newAbsence = new Absence({
          userId: req.user._id,
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
        annualLeave: req.user.annualLeave,
        manager: req.user.position === "manager" ? true : false,
        admin: req.user.isAdmin === "Yes" ? true : false,
        isLocked: req.user.isLocked,
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
  const annualLeave = req.user.annualLeave;
  const daysRemain = annualLeave - dayLeaveRequest;

  // Nếu số ngày đk nghỉ nhỏ hơn số ngày phép còn lại thì cập nhập dữ liệu model, nếu không thì đưa ra thông báo lỗi.
  if (dayLeaveRequest <= annualLeave) {
    Absence.findOne({ userId: req.user._id })
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
    User.findByIdAndUpdate(
      req.user._id,
      { annualLeave: daysRemain },
      function (err, res) {
        if (err) throw err;
        console.log(res);
      }
    );
  } else {
    res.render("absence", {
      pageTitle: "Đăng ký nghỉ",
      user: req.session.user,
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
      fromHour: req.body.fromHour,
      toHour: req.body.toHour,
      reason: req.body.reason,
      annualLeave: req.user.annualLeave,
      manager: req.user.position === "manager" ? true : false,
      admin: req.user.isAdmin === "Yes" ? true : false,
      active: { timesheet: true },
      isAuthenticated: req.session.isLoggedIn,
      errMessage:
        "Đăng ký không thành công. Số ngày đăng ký vượt quá số ngày phép còn lại.",
    });
  }
};

//#region // Get Absence Details Page
exports.getAbsenceDetails = (req, res, next) => {
  Absence.findOne({ userId: req.user._id })
    .lean()
    .then((absence) => {
      return absence;
    })
    .then((absence) => {
      res.render("absence-details", {
        pageTitle: "Nghỉ phép",
        user: req.session.user,
        absence: absence,
        annualLeave: req.user.annualLeave,
        manager: req.user.position === "manager" ? true : false,
        admin: req.user.isAdmin === "Yes" ? true : false,
        active: { timesheet: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};
//#endregion
