const User = require("../models/user");
// const crypto = require("crypto");

const bcrypt = require("bcryptjs");
// const nodemailer = require("nodemailer");
// const sendgridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator/check");

// Check if user is logged in to add new attendance
// exports.loggedIn = function (req, res, next) {
//   console.log(this.email);
//   User.findOne({ email: "admin@gmail.com", password: "123456" })
//     // User.findById("6309bd4fea30ed1222ecfa91")
//     .lean()
//     .then((user) => {
//       req.user = user;
//       next();
//     })
//     .catch((err) => console.log(err));
// };

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  res.render("login", {
    pageTitle: "Login",
  });
};

// exports.postLogin = (req, res, next) => {
//   const email = req.body.email;
//   const password = req.body.password;
//   console.log(email);
//   User.findOne({ email: email, password: password })
//     .then((user) => {
//       req.user = user;
//       next();
//       res.redirect("/");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  User.findOne({ email: email })
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        console.log(err);
        res.redirect("/");
        console.log(user);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// exports.postLogin = (req, res, next) => {
//   const email = req.body.email;
//   const password = req.body.password;
//   console.log(email);

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(422).render("auth/login", {
//       path: "/login",
//       pageTitle: "Login",
//       errorMessage: errors.array()[0].msg,
//       oldInput: {
//         email: email,
//         password: password,
//       },
//       validationErrors: errors.array(),
//     });
//   }

//   User.findOne({ email: email })
//     .then((user) => {
//       console.log(user);
//       if (!user) {
//         return res.status(422).render("login", {
//           path: "/login",
//           pageTitle: "Login",
//           errorMessage: "Invalid email or password.",
//           oldInput: {
//             email: email,
//             password: password,
//           },
//           validationErrors: [],
//         });
//       }
//       bcrypt
//         .compare(password, user.password)
//         .then((doMatch) => {
//           if (doMatch) {
//             req.session.isLoggedIn = true;
//             req.session.user = user;
//             return req.session.save((err) => {
//               console.log(err);
//               res.redirect("/");
//             });
//           }
//           return res.status(422).render("login", {
//             path: "/login",
//             pageTitle: "Login",
//             errorMessage: "Invalid email or password.",
//             oldInput: {
//               email: email,
//               password: password,
//             },
//             validationErrors: [],
//           });
//         })
//         .catch((err) => {
//           console.log(err);
//           res.redirect("/login");
//         });
//     })
//     .catch((err) => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

// Get Home Page
exports.getHome = (req, res, next) => {
  console.log(req.session.user);
  const user = req.session.user;
  if (user) {
    res.render("home", {
      user: user,
      pageTitle: "Trang chủ",
      active: { home: true },
      isAuthenticated: req.session.isLoggedIn,
    });
  } else {
    res.render("login", {
      pageTitle: "Login",
      active: { login: true },
    });
  }
};

// Get About Page
exports.getAbout = (req, res, next) => {
  res.render("about", {
    pageTitle: "Giới thiệu",
    user: req.session.user,
    active: { about: true },
    isAuthenticated: req.session.isLoggedIn,
  });
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
