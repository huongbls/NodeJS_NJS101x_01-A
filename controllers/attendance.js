const Attendance = require("../models/attendance");
const User = require("../models/user");

// Get Start Working Page
exports.getAttendace = (req, res, next) => {
  res.render("attendance", {
    css: "attendance",
    pageTitle: "Điểm danh",
    user: req.user,
  });
};

// Get Attendance Details Page
exports.getAttendanceDetails = (req, res, next) => {
  const today = new Date().toLocaleDateString();
  Attendance.findOne({ userId: req.user._id, date: today })
    .lean()
    .then((attendance) => {
      let totalhour = 0;
      if (attendance) {
        attendance.details.forEach((item) => {
          // Tính tổng giờ làm của một ngày
          if (item.endTime && item.startTime) {
            const sessionWorkingHour = (
              (item.endTime - item.startTime) /
              3.6e6
            ).toFixed(1);
            totalhour += parseFloat(sessionWorkingHour);
          }
        });
      }
      res.render("attendance-details", {
        pageTitle: "Chi tiết công việc",
        attendance: attendance,
        totalhour: totalhour,
      });
    })
    .catch((err) => console.log(err));
};

// Post Attendance: Start - Stop
exports.postAttendance = (req, res, next) => {
  const type = req.query.type;
  const workplace = req.body.workplace;
  const user = new User(req.user);
  // Change working status user
  user
    .getStatus(type, workplace)
    .then((status) => {
      if (type === "start") {
        res.redirect("/");
      }
      res.redirect("/attendance-details");
    })
    .catch((err) => console.log(err));
};
