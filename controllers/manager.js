const User = require("../models/user");
const Absence = require("../models/absence");
const Attendance = require("../models/attendance");

//get Approve Timesheet of employees
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

// get Approve Timesheet Search
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
  // console.log(staffTimesheet);
  console.log(staffTimesheet[0].workingRecord);
  // console.log(staffTimesheet[1].workingRecord);
  // console.log(staffTimesheet[2].workingRecord);

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

// post Lock Employee
exports.postLockEmployee = (req, res, next) => {
  const isLocked = req.query.isLocked;
  const id = req.query.id;
  User.findByIdAndUpdate(id, {
    isLocked: isLocked === "true" ? false : true,
  }).then(() => {
    res.redirect("/approve-timesheet");
  });
};

// post delete session working
exports.postDeleteSessionWorking = async (req, res, next) => {
  const id = req.query.id;
  const searchMonth = req.query.searchMonth;
  const date = new Date(new Date(req.query.date).toDateString()); //T17:00:00.000Z
  const startTime = new Date(req.query.startTime);
  const startTimeData = new Date(
    startTime.getFullYear(),
    startTime.getMonth() + 1,
    startTime.getDate(),
    startTime.getHours() - 7,
    startTime.getMinutes(),
    startTime.getSeconds()
  ).toTimeString();
  const absenceArr = [];
  const detailArr = [];
  const attendance = await Attendance.find({ userId: id, date: date });
  attendance.forEach((attend) => {
    attend.details.forEach((item) => {
      if (item.startTime.toTimeString() !== startTimeData) {
        detailArr.push(item);
      }
    });
  });
  const absence = await Absence.find({ userId: id });
  absence.forEach((leave) => {
    leave.registerLeave.forEach((item) => {
      if (
        new Date(item.fromDate).toISOString().slice(0, 10) !==
        new Date(req.query.date).toISOString().slice(0, 10)
      ) {
        absenceArr.push(item);
      }
    });
  });
  const deleteFromAbsence = await Absence.findOneAndUpdate(
    { userId: id },
    { $set: { registerLeave: absenceArr } },
    { new: true }
  );
  const deleteFromAttendance = await Attendance.findOneAndUpdate(
    { userId: id, date: date },
    { $set: { details: detailArr } },
    { new: true }
  );
  const deleteFromAttendance2 = await Attendance.findOneAndDelete({
    userId: id,
    date: date,
    details: [],
    totalWorkingHour: 0,
    totalHour: 0,
    overTime: 0,
  });
  res.redirect(`/approve-timesheet-search?searchMonth=${searchMonth}`);
};
