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
    admin: req.user.isAdmin === "Yes" ? true : false,
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
      isLocked: member.isLocked,
    });
  });

  for (const member of deptMembers) {
    let workingRecord = [];
    const user = new User(member);
    const statistics = await user.getStatistic();
    staffTimesheet.forEach((object) => {
      statistics.forEach((x) => {
        if (object._id.toString() === member._id.toString()) {
          if (
            x.date >= firstDayOfMonth &&
            x.date <= lastDayOfMonth &&
            x.totalHour >= 0
          ) {
            workingRecord.push(x);
          }
          Object.assign(object, {
            workingRecord: workingRecord,
          });
        }
      });
    });
  }

  res.render("manager/approve-timesheet", {
    member: staffTimesheet,
    user: req.session.user,
    searchMonth: searchMonth,
    active: { approve: true },
    isAuthenticated: req.session.isLoggedIn,
    manager: req.user.position === "manager" ? true : false,
    admin: req.user.isAdmin === "Yes" ? true : false,
  });
};

exports.postLockEmployee = (req, res, next) => {
  const isLocked = req.query.isLocked;
  const id = req.query.id;
  User.findByIdAndUpdate(id, {
    isLocked: isLocked === "true" ? false : true,
  }).then(() => {
    res.redirect("/approve-timesheet");
  });
};

exports.postDeleteWorkingRecord = async (req, res, next) => {
  const deleted = req.query.delete;
  const id = req.query.id;
  const searchMonth = req.query.searchMonth;
  const firstDayOfMonth = new Date(searchMonth);
  const lastDayOfMonth = new Date(
    new Date(searchMonth).getFullYear(),
    new Date(searchMonth).getMonth() + 1,
    1
  );
  const arr = [];

  const absence = await Absence.find({ userId: id });
  absence.forEach((leave) => {
    leave.registerLeave.forEach((item) => {
      if (item.fromDate < firstDayOfMonth || item.fromDate > lastDayOfMonth) {
        arr.push(item);
      }
    });
  });

  const deleteFromAttendance = await Attendance.deleteMany({
    userId: id,
    date: { $gt: firstDayOfMonth, $lt: lastDayOfMonth },
  });

  const deleteFromAbsence = await Absence.findOneAndUpdate(
    { userId: id },
    { $set: { registerLeave: arr } },
    { new: true }
  );
  res.redirect(`/approve-timesheet-search?searchMonth=${searchMonth}`);
};
