const User = require("../models/user");
const fileHelper = require("../ultil/file");
const path = require("path");

// Get Home Page
exports.getHome = (req, res, next) => {
  const user = req.user;
  if (req.session.isLoggedIn) {
    res.render("home", {
      user: req.session.user,
      userName: user.name,
      manager: user.position === "manager" ? true : false,
      admin: req.user.isAdmin === "Yes" ? true : false,
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
      manager: req.user.position === "manager" ? true : false,
      admin: req.user.isAdmin === "Yes" ? true : false,
      active: { about: true },
      isAuthenticated: req.session.isLoggedIn,
    });
  } else {
    res.redirect("/login");
  }
};

// GEt Edit User Page
exports.getEditUser = (req, res, next) => {
  User.findById(req.params.userId)
    .lean()
    .then((user) => {
      res.render("edit-user", {
        pageTitle: user.name,
        user: user,
        manager: req.user.position === "manager" ? true : false,
        admin: req.user.isAdmin === "Yes" ? true : false,
        image: req.user.image,
        active: { user: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// Post edit user
exports.postEditUser = (req, res, next) => {
  const { id } = req.body;
  const imageFile = req.file;
  User.findById(id)
    .then((user) => {
      if (user.image) {
        console.log(user.image !== "/images/male-icon.png");
        // if (
        //   user.image !== "/images/male-icon.png" ||
        //   user.image !== "/images/female-icon.png"
        // ) {
        //   fileHelper.deleteFile(user.image);
        // }
        user.image = imageFile.path.substring(6);
      }
      return user.save();
    })
    .then((result) => {
      console.log("UPDATED IMAGE!");
      res.redirect(`/edit-user/${id}`);
    })
    .catch((err) => console.log(err));
};

// Get all statistics of attendance
exports.getWorkingHourStatistic = async (req, res, next) => {
  const user = new User(req.user);
  const page = +req.query.page || 1;
  const ITEMS_PER_PAGE = +req.query.rowNum || 10;
  let totalWorkingDays;
  const manager = await User.findOne({
    department: user.department,
    position: "manager",
  });
  const director = await User.findOne({
    position: "director",
  });
  const managerName = manager.name;
  const managerId = manager._id;
  const directorName = director.name;
  const directorId = director._id;
  user
    .getStatistic()
    .then((statistic) => {
      console.log(statistic);
      console.log(statistic.filter((x) => x.totalHour >= 0));
      // console.log(statistic.filter((x) => x.totalHour >= 0));
      totalWorkingDays = statistic.filter((x) => x.totalHour >= 0).length;
      if (totalWorkingDays) {
        res.render("workingHourStatistic", {
          pageTitle: "Thông tin giờ làm",
          user: req.session.user,
          manager: req.user.position === "manager" ? true : false,
          admin: req.user.isAdmin === "Yes" ? true : false,
          workingHourStatistic: statistic
            .filter((x) => x.totalHour >= 0)
            .slice(
              ITEMS_PER_PAGE * (page - 1),
              ITEMS_PER_PAGE * (page - 1) + ITEMS_PER_PAGE
            ),
          totalWorkingDays: totalWorkingDays,
          position: user.position,
          managerName: managerName,
          managerId: managerId,
          directorName: directorName,
          directorId: directorId,
          active: { record: true },
          isAuthenticated: req.session.isLoggedIn,
          ITEMS_PER_PAGE: ITEMS_PER_PAGE,
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalWorkingDays,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalWorkingDays / ITEMS_PER_PAGE),
        });
      } else {
        res.render("workingHourStatistic", {
          pageTitle: "Thông tin giờ làm",
          user: req.session.user,
          manager: req.user.position === "manager" ? true : false,
          workingHourStatistic: statistic,
          totalWorkingDays: totalWorkingDays,
          active: { record: true },
          isAuthenticated: req.session.isLoggedIn,
        });
      }
    })
    .catch((err) => console.log(err));
};

// Get Working Hour Statistic with Wildcard
exports.getWorkingHourStatisticSearch = async function (req, res, next) {
  const user = new User(req.user);
  const searchFromDate = new Date(req.query.searchFromDate);
  const searchToDate = new Date(req.query.searchToDate);
  const page = +req.query.page || 1;
  const ITEMS_PER_PAGE = +req.query.rowNum || 10;
  const manager = await User.findOne({
    department: user.department,
    position: "manager",
  });
  const director = await User.findOne({
    position: "director",
  });
  const managerName = manager.name;
  const managerId = manager._id;
  const directorName = director.name;
  const directorId = director._id;
  let totalWorkingDays;
  let currStatistic = [];

  user
    .getStatistic()
    .then((statistic) => {
      statistic.forEach((x) => {
        if (x.date <= searchToDate && x.date >= searchFromDate) {
          currStatistic.push(x);
        }
      });
      totalWorkingDays = currStatistic.filter((x) => x.totalHour >= 0).length;
      if (totalWorkingDays) {
        res.render("workingHourStatistic", {
          pageTitle: "Tra cứu thông tin giờ làm",
          user: req.session.user,
          manager: req.user.position === "manager" ? true : false,
          admin: req.user.isAdmin === "Yes" ? true : false,
          workingHourStatistic: currStatistic
            .filter((x) => x.totalHour >= 0)
            .slice(
              ITEMS_PER_PAGE * (page - 1),
              ITEMS_PER_PAGE * (page - 1) + ITEMS_PER_PAGE
            ),
          totalWorkingDays: totalWorkingDays,
          searchFromDate: req.query.searchFromDate,
          searchToDate: req.query.searchToDate,
          isNaNSearchFromDate: isNaN(searchFromDate),
          isNaNSearchToDate: isNaN(searchToDate),
          position: user.position,
          managerName: managerName,
          managerId: managerId,
          directorName: directorName,
          directorId: directorId,
          active: { record: true },
          isAuthenticated: req.session.isLoggedIn,
          ITEMS_PER_PAGE: ITEMS_PER_PAGE,
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalWorkingDays,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalWorkingDays / ITEMS_PER_PAGE),
        });
      } else {
        res.render("workingHourStatistic", {
          pageTitle: "Tra cứu thông tin giờ làm",
          user: req.session.user,
          manager: req.user.position === "manager" ? true : false,
          admin: req.user.isAdmin === "Yes" ? true : false,
          workingHourStatistic: currStatistic,
          searchFromDate: searchFromDate,
          searchToDate: searchToDate,
          isNaNSearchFromDate: isNaN(searchFromDate),
          isNaNSearchToDate: isNaN(searchToDate),
          active: { record: true },
          isAuthenticated: req.session.isLoggedIn,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// Get Salary Statistic
exports.getSalaryStatistic = (req, res, next) => {
  const user = new User(req.user);
  const salaryStatistic = user.getWorkingMonths();
  const salaryScale = user.salaryScale;
  const page = +req.query.page || 1;
  const ITEMS_PER_PAGE = +req.query.monthNum || 12;
  let totalWorkingMonths;
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
      totalWorkingMonths = salaryStatistic.length;
      if (totalWorkingMonths) {
        res.render("salaryStatistic", {
          pageTitle: "Thông tin bảng lương",
          user: req.session.user,
          manager: req.user.position === "manager" ? true : false,
          admin: req.user.isAdmin === "Yes" ? true : false,
          salaryStatistic: salaryStatistic.slice(
            ITEMS_PER_PAGE * (page - 1),
            ITEMS_PER_PAGE * (page - 1) + ITEMS_PER_PAGE
          ),
          active: { record: true },
          isAuthenticated: req.session.isLoggedIn,
          ITEMS_PER_PAGE: ITEMS_PER_PAGE,
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalWorkingMonths,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalWorkingMonths / ITEMS_PER_PAGE),
        });
      } else {
        res.render("salaryStatistic", {
          pageTitle: "Thông tin bảng lương",
          user: req.session.user,
          manager: req.user.position === "manager" ? true : false,
          admin: req.user.isAdmin === "Yes" ? true : false,
          salaryStatistic: salaryStatistic,
          active: { record: true },
          isAuthenticated: req.session.isLoggedIn,
        });
      }
    })
    .catch((err) => console.log(err));
};

// Get Salary Statistic with Wildcard
exports.getSalaryStatisticSearch = function (req, res, next) {
  const user = new User(req.user);
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
        manager: req.user.position === "manager" ? true : false,
        admin: req.user.isAdmin === "Yes" ? true : false,
        salaryStatistic: currStatistic,
        searchMonth: `${
          searchMonth.getUTCMonth() + 1
        }/${searchMonth.getUTCFullYear()}`,
        month: req.query.searchMonth,
        active: { record: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};
