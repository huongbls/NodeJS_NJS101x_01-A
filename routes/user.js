const express = require("express");
const userController = require("../controllers/user");
const covidController = require("../controllers/covid");
const absenceController = require("../controllers/absence");
const attendanceController = require("../controllers/attendance");
const authController = require("../controllers/auth");
const managerController = require("../controllers/manager");
const isAuth = require("../middleware/is-auth");
const isManager = require("../middleware/is-manager");
const visitedPath = require("../middleware/visitedpath");
const router = express.Router();

// Home Page
router.get("/", isAuth, visitedPath, userController.getHome);

// Login Page
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogout);
// router.get("/", userController.loggedIn);

// User Details Page
router.get(
  "/edit-user/:userId",
  isAuth,
  visitedPath,
  userController.getEditUser
);
router.post("/edit-user", visitedPath, userController.postEditUser);

// About Page
router.get("/about", isAuth, visitedPath, userController.getAbout);

// Statistic Page
router.get(
  "/workingHourStatistic",
  isAuth,
  visitedPath,
  userController.getWorkingHourStatistic
);
router.get(
  "/salaryStatistic",
  isAuth,
  visitedPath,
  userController.getSalaryStatistic
);
router.get(
  "/workingHourStatistic-search",
  isAuth,
  visitedPath,
  userController.getWorkingHourStatisticSearch
);
router.get(
  "/salaryStatistic-search",
  isAuth,
  visitedPath,
  userController.getSalaryStatisticSearch
);

// Attendance Page
router.get(
  "/attendance",
  isAuth,
  visitedPath,
  attendanceController.getAttendace
);
router.get(
  "/attendance-details",
  visitedPath,
  attendanceController.getAttendanceDetails
);
router.post("/attendance", visitedPath, attendanceController.postAttendance);

// Absence Page
router.get("/absence", isAuth, visitedPath, absenceController.getAbsence);
router.get(
  "/absence-details",
  isAuth,
  visitedPath,
  absenceController.getAbsenceDetails
);
router.post("/absence", visitedPath, absenceController.postAbsence);

// Covid Page
router.get("/covid", isAuth, visitedPath, covidController.getCovid);
router.get(
  "/covid-details",
  isAuth,
  visitedPath,
  covidController.getCovidDetails
);
router.post("/covid", visitedPath, covidController.postCovid);
router.get(
  "/covid-details-staffs",
  isAuth,
  isManager,
  visitedPath,
  covidController.getCovidDetailsStaffs
);
router.get(
  "/covid-details-staffs/thong-tin-covid.pdf",
  isAuth,
  isManager,
  visitedPath,
  covidController.getPDF
);

router.get(
  "/approve-timesheet",
  isAuth,
  isManager,
  visitedPath,
  managerController.getApproveTimesheet
);
router.get(
  "/approve-timesheet-search",
  isAuth,
  isManager,
  visitedPath,
  managerController.getApproveTimesheetSearch
);

router.post(
  "/approve-timesheet",
  visitedPath,
  managerController.postLockEmployee
);

router.post(
  "/approve-timesheet-search",
  visitedPath,
  managerController.postDeleteSessionWorking
);

module.exports = router;
