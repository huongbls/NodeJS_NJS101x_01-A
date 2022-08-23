const Attendance = require("../models/attendance");
const User = require("../models/user");

// Get Start Working Page
exports.getAttendace = (req, res, next) => {
  Attendance.findOne({
    userId: req.user._id,
    date: new Date().toLocaleDateString(),
  })
    .lean()
    .then((result) => {
      if (!result) {
        const newAttendance = new Attendance({
          userId: req.user._id,
          date: new Date().toLocaleDateString(),
          details: [],
        });
        return newAttendance.save();
      }
      return result;
    })
    .then((attendance) => {
      res.render("attendance", {
        pageTitle: "Điểm danh",
        user: req.user,
        date: new Date(),
      });
    })
    .catch((err) => console.log(err));
};

// Post Attendance: Start - Stop
exports.postAttendance = (req, res, next) => {
  const type = req.query.type;
  const workplace = req.body.workplace;
  const user = new User(req.user);
  if (type === "start") {
    Attendance.findOne({
      userId: req.user._id,
      date: new Date().toLocaleDateString(),
    })
      .then((attendance) => {
        attendance.details.unshift({
          startTime: new Date(),
          endTime: null,
          workplace: req.body.workplace,
        });
        return attendance.save();
      })
      .then((status) => {
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
      date: new Date().toLocaleDateString(),
    })
      .then((attendance) => {
        attendance.details[0].endTime = new Date();
        return attendance.save();
      })
      .then((status) => {
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
  const today = new Date().toLocaleDateString();
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
        attendance: attendance,
        totalWorkingHour: totalWorkingHour,
      });
    })
    .catch((err) => console.log(err));
};
