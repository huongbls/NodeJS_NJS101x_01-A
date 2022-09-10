const User = require("../models/user");
const Absence = require("../models/absence");
const Attendance = require("../models/attendance");

exports.getApproveTimesheet = async (req, res, next) => {
  const month = new Date().toISOString().slice(0, 7);
  const deptMembers = await User.find({
    department: req.user.department,
    position: "staff",
  }).lean();

  res.render("manager/approve-timesheet", {
    active: { approve: true },
    member: deptMembers,
    month: month,
    user: req.session.user,
    isAuthenticated: req.session.isLoggedIn,
    manager: req.user.position === "manager" ? true : false,
  });
};

exports.getApproveTimesheetSearch = async (req, res, next) => {
  let staffTimesheet = [];
  const searchMonth = req.query.searchMonth;
  const searchEmployee = req.query.searchEmployee;
  const deptMembers = await User.find({
    department: req.user.department,
    position: "staff",
  }).lean();
  const firstDayOfMonth = new Date(searchMonth);
  const lastDayOfMonth = new Date(
    new Date(searchMonth).getFullYear(),
    new Date(searchMonth).getMonth() + 1,
    1
  );

  deptMembers.forEach((member) => {
    if (member.name === searchEmployee) {
      staffTimesheet.push({
        _id: member._id,
        name: member.name,
      });
      const user = new User(member);
      user.getStatistic().then((statistic) => {
        statistic.forEach((x) => {
          if (x.date >= firstDayOfMonth && x.date <= lastDayOfMonth) {
            staffTimesheet.push(x);
          }
        });
        res.render("manager/approve-timesheet", {
          member: deptMembers,
          user: req.session.user,
          searchMonth: searchMonth,
          searchEmployee: searchEmployee,
          staffTimesheet: staffTimesheet,
          active: { approve: true },
          isAuthenticated: req.session.isLoggedIn,
          manager: req.user.position === "manager" ? true : false,
        });
      });
    }
  });
};

exports.postApproveTimesheet = (req, res, next) => {
  const confirmed = req.query.confirmed;
  Attendance.findOneAndUpdate()
    .then()
    .catch((err) => console.log(err));
  Absence.findByIdAndUpdate()
    .then()
    .catch((err) => console.log(err));
  if (confirmed === "yes") {
    res.redirect("/confirmed-timesheet");
  }
};

exports.getConfirmedApproveTimesheet = async (req, res, next) => {
  res.render("manager/confirmed-timesheet", {
    active: { approve: true },
    user: req.session.user,
    isAuthenticated: req.session.isLoggedIn,
    manager: req.user.position === "manager" ? true : false,
  });
};
