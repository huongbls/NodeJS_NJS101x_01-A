const User = require("../models/user");
// const crypto = require("crypto");

// Get Home Page
exports.getHome = (req, res, next) => {
  if (req.session.isLoggedIn) {
    const user = req.user;
    res.render("home", {
      user: req.session.user,
      userName: user.name,
      workplace: user.workplace,
      isWorking: user.isWorking,
      pageTitle: "Trang chủ",
      active: { home: true },
      isAuthenticated: req.session.isLoggedIn,
    });
  } else {
    res.redirect("/login");
  }
};

// Get About Page
exports.getAbout = (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.render("about", {
      pageTitle: "Giới thiệu",
      user: req.session.user,
      active: { about: true },
      isAuthenticated: req.session.isLoggedIn,
    });
  } else {
    res.redirect("/login");
  }
};

// GEt Edit User Page
exports.getEditUser = (req, res, next) => {
  console.log(req.params.userId);
  User.findById(req.params.userId)
    .lean()
    .then((user) => {
      res.render("edit-user", {
        pageTitle: user.name,
        user: user,
        active: { user: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// Post edit user
exports.postEditUser = (req, res, next) => {
  const { id, image } = req.body;
  User.findById(id)
    .then((user) => {
      user.image = image;
      user.save();
      res.redirect(`/edit-user/${id}`);
    })
    .catch((err) => console.log(err));
};

// Get all statistics of attendance
exports.getWorkingHourStatistic = (req, res, next) => {
  const user = new User(req.session.user);
  user
    .getStatistic()
    .then((statistic) => {
      res.render("workingHourStatistic", {
        pageTitle: "Thông tin giờ làm",
        user: req.session.user,
        workingHourStatistic: statistic,
        active: { record: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getSalaryStatistic = (req, res, next) => {
  const user = new User(req.session.user);
  const salaryStatistic = user.getWorkingMonths();
  const salaryScale = user.salaryScale;
  let totalSalary = 0;
  let totalHourForSalary = 0;
  let totalOvertimeForSalary = 0;
  let totalMissingHourForSalary = 0;
  let workingBusinessDay = 0;
  user
    .getStatistic()
    .then((statistic) => {
      salaryStatistic.forEach((object) => {
        statistic.forEach((item) => {
          const year = item.date.getUTCFullYear();
          const month = item.date.getUTCMonth() + 1;
          const day = item.date.getUTCDay();
          const mmYYYY = `${month}/${year}`;
          if (mmYYYY === object.month) {
            workingBusinessDay = user.getWorkingBussinessDay(year, month - 1);
            if (item.totalHour) totalHourForSalary += item.totalHour;
            if (item.overTime) totalOvertimeForSalary += item.overTime;
            if (day >= 1 && day <= 5 && !item.totalHour) {
              totalMissingHourForSalary += 8;
            }
            if (
              day >= 1 &&
              day <= 5 &&
              item.totalHour > 0 &&
              item.totalHour < 8
            ) {
              const missingHour = 8 - item.totalHour;
              totalMissingHourForSalary += missingHour;
            }
            if (totalHourForSalary === workingBusinessDay * 8) {
              totalSalary = salaryScale * 3e6;
            } else if (totalHourForSalary < workingBusinessDay * 8) {
              totalSalary =
                ((salaryScale * 3e6) / (workingBusinessDay * 8)) *
                totalHourForSalary;
            } else if (totalHourForSalary > workingBusinessDay * 8) {
              totalSalary =
                salaryScale * 3e6 + (totalOvertimeForSalary / 8) * 2e5;
            }
          }
          Object.assign(object, {
            totalHour: totalHourForSalary,
            overTime: totalOvertimeForSalary,
            missingHour: totalMissingHourForSalary,
            missingDay: (totalMissingHourForSalary / 8).toFixed(1),
            totalSalary: totalSalary.toFixed(0),
            workingBussinessDay: workingBusinessDay,
          });
        });
        totalHourForSalary = 0;
        totalOvertimeForSalary = 0;
        totalMissingHourForSalary = 0;
        totalSalary = 0;
        workingBusinessDay = 0;
      });
      return salaryStatistic;
    })
    .then((salaryStatistic) => {
      res.render("salaryStatistic", {
        pageTitle: "Thông tin bảng lương",
        user: req.session.user,
        salaryStatistic: salaryStatistic,
        active: { record: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// Get Working Hour Statistic with Wildcard
exports.getWorkingHourStatisticSearch = function (req, res, next) {
  const user = new User(req.session.user);
  const searchFromDate = new Date(req.query.searchFromDate);
  const searchToDate = new Date(req.query.searchToDate);
  let currStatistic = [];
  user
    .getStatistic()
    .then((statistic) => {
      statistic.forEach((x) => {
        if (x.date <= searchToDate && x.date >= searchFromDate) {
          currStatistic.push(x);
        }
      });
      res.render("workingHourStatistic", {
        pageTitle: "Tra cứu thông tin giờ làm",
        user: req.session.user,
        workingHourStatistic: currStatistic,
        searchFromDate: searchFromDate,
        searchToDate: searchToDate,
        isNaNSearchFromDate: isNaN(searchFromDate),
        isNaNSearchToDate: isNaN(searchToDate),
        active: { record: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// Get Salary Statistic with Wildcard
exports.getSalaryStatisticSearch = function (req, res, next) {
  const user = new User(req.session.user);
  const salaryStatistic = user.getWorkingMonths();
  const salaryScale = user.salaryScale;
  const searchMonth = new Date(req.query.searchMonth);
  let currStatistic = [];
  let totalSalary = 0;
  let totalHourForSalary = 0;
  let totalOvertimeForSalary = 0;
  let totalMissingHourForSalary = 0;
  let workingBusinessDay = 0;
  user
    .getStatistic()
    .then((statistic) => {
      salaryStatistic.forEach((object) => {
        statistic.forEach((item) => {
          const year = item.date.getUTCFullYear();
          const month = item.date.getUTCMonth() + 1;
          const day = item.date.getUTCDay();
          const mmYYYY = `${month}/${year}`;
          if (mmYYYY === object.month) {
            workingBusinessDay = user.getWorkingBussinessDay(year, month - 1);
            if (item.totalHour) totalHourForSalary += item.totalHour;
            if (item.overTime) totalOvertimeForSalary += item.overTime;
            if (day >= 1 && day <= 5 && !item.totalHour) {
              totalMissingHourForSalary += 8;
            }
            if (
              day >= 1 &&
              day <= 5 &&
              item.totalHour > 0 &&
              item.totalHour < 8
            ) {
              const missingHour = 8 - item.totalHour;
              totalMissingHourForSalary += missingHour;
            }
            if (totalHourForSalary === workingBusinessDay * 8) {
              totalSalary = salaryScale * 3e6;
            } else if (totalHourForSalary < workingBusinessDay * 8) {
              totalSalary =
                ((salaryScale * 3e6) / (workingBusinessDay * 8)) *
                totalHourForSalary;
            } else if (totalHourForSalary > workingBusinessDay * 8) {
              totalSalary =
                salaryScale * 3e6 + (totalOvertimeForSalary / 8) * 2e5;
            }
          }
          Object.assign(object, {
            totalHour: totalHourForSalary,
            overTime: totalOvertimeForSalary,
            missingHour: totalMissingHourForSalary,
            missingDay: (totalMissingHourForSalary / 8).toFixed(1),
            totalSalary: totalSalary.toFixed(0),
            workingBussinessDay: workingBusinessDay,
          });
        });
        totalHourForSalary = 0;
        totalOvertimeForSalary = 0;
        totalMissingHourForSalary = 0;
        totalSalary = 0;
        workingBusinessDay = 0;
      });
      return salaryStatistic;
    })
    .then((salaryStatistic) => {
      const mmYYYY = `${
        searchMonth.getUTCMonth() + 1
      }/${searchMonth.getUTCFullYear()}`;
      salaryStatistic.forEach((item) => {
        if (item.month === mmYYYY) {
          currStatistic.push(item);
        }
      });
      return currStatistic;
    })
    .then(() => {
      res.render("salaryStatistic", {
        pageTitle: "Thông tin bảng lương",
        user: req.session.user,
        salaryStatistic: currStatistic,
        searchMonth: `${
          searchMonth.getUTCMonth() + 1
        }/${searchMonth.getUTCFullYear()}`,
        active: { record: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};
