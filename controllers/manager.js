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
    staffTimesheet.push({
      name: member.name,
      _id: member._id,
    });
  });

  deptMembers.forEach((member) => {
    let workingRecord = [];
    const user = new User(member);
    user.getStatistic().then((statistic) => {
      staffTimesheet.forEach((object) => {
        statistic.forEach((x) => {
          if (object._id.toString() === member._id.toString()) {
            if (x.date >= firstDayOfMonth && x.date <= lastDayOfMonth) {
              workingRecord.push(x);
            }
            Object.assign(object, { workingRecord: workingRecord });
          }
        });
      });
      return staffTimesheet;
    });
  });

  res.render("manager/approve-timesheet", {
    member: deptMembers,
    user: req.session.user,
    searchMonth: searchMonth,
    staffTimesheet: staffTimesheet,
    active: { approve: true },
    isAuthenticated: req.session.isLoggedIn,
    manager: req.user.position === "manager" ? true : false,
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
