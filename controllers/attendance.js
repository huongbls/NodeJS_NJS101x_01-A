const Attendance = require("../models/attendance");
const User = require("../models/user");

// Get Attendance Page (Check in /Check out)
exports.getAttendace = (req, res, next) => {
  Attendance.findOne({
    userId: req.user._id,
    date: new Date(new Date().toDateString()),
  })
    .lean()
    .then((result) => {
      if (!result) {
        const newAttendance = new Attendance({
          userId: req.user._id,
          date: new Date(new Date().toDateString()),
          details: [],
        });
        return newAttendance.save();
      }
      return result;
    })
    .then((attendance) => {
      console.log(req.user);
      res.render("attendance", {
        pageTitle: "Điểm danh",
        user: req.session.user,
        isWorking: req.user.isWorking,
        userName: req.user.name,
        isLocked: req.user.isLocked,
        manager: req.user.position === "manager" ? true : false,
        admin: req.user.isAdmin === "Yes" ? true : false,
        date: new Date(),
        active: { timesheet: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// Post Attendance: Start - Stop
exports.postAttendance = (req, res, next) => {
  const type = req.query.type;
  if (type === "start") {
    Attendance.findOne({
      userId: req.user._id,
      date: new Date(new Date().toDateString()),
    })
      .then((attendance) => {
        attendance.details.unshift({
          startTime: new Date(),
          endTime: null,
          workplace: req.body.workplace,
        });
        return attendance.save();
      })
      .then((result) => {
        res.redirect("/");
      })
      .catch((err) => console.log(err));

    User.findByIdAndUpdate(req.user._id, {
      isWorking: true,
      workplace: req.body.workplace,
    }).catch((err) => console.log(err));
  } else if (type === "stop") {
    Attendance.findOne({
      userId: req.user._id,
      date: new Date(new Date().toDateString()),
    })
      .then((attendance) => {
        attendance.details[0].endTime = new Date();
        return attendance.save();
      })
      .then((result) => {
        res.redirect("/attendance-details");
      })
      .catch((err) => console.log(err));

    User.findByIdAndUpdate(req.user._id, {
      isWorking: false,
      workplace: "Chưa xác định",
    }).catch((err) => console.log(err));
  }
};

// Get Attendance Details Page
exports.getAttendanceDetails = (req, res, next) => {
  const today = new Date(new Date().toDateString());
  Attendance.findOne({ userId: req.user._id, date: today })
    .lean()
    .then((attendance) => {
      let totalWorkingHour = 0;
      if (attendance) {
        attendance.details.forEach((item) => {
          totalWorkingHour += Attendance.calcTotalWorkingHour(
            item.startTime,
            item.endTime
          );
        });
      }
      res.render("attendance-details", {
        pageTitle: "Chi tiết công việc",
        user: req.session.user,
        manager: req.user.position === "manager" ? true : false,
        admin: req.user.isAdmin === "Yes" ? true : false,
        attendance: attendance,
        totalWorkingHour: totalWorkingHour,
        active: { timesheet: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};
