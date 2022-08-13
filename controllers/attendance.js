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
  // const listToday = Attendance.details.find((date) => {
  //   date = new Date();
  // });
  // console.log("listToday: " + listToday);
  // Attendance.where({details: })
  Attendance.findOne({ user: req.user._id })
    .lean()
    .then((attendance) => {
      res.render("attendance-details", {
        css: "attendance",
        pageTitle: "Chi tiết công việc",
        user: req.user,
        attendance: attendance,
        // date: attendance.date,
      });
    });
};

// Post Attendance: Start - Stop
exports.postAttendance = (req, res, next) => {
  const user = new User(req.user);
  const type = req.query.type;
  const workplace = req.body.workplace;
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
