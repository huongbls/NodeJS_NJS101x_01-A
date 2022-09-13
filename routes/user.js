const express = require("express");
const userController = require("../controllers/user");
const covidController = require("../controllers/covid");
const absenceController = require("../controllers/absence");
const attendanceController = require("../controllers/attendance");
const authController = require("../controllers/auth");
const managerController = require("../controllers/manager");
const isAuth = require("../middleware/is-auth");
const isManager = require("../middleware/is-manager");
const router = express.Router();

// Home Page
router.get("/", userController.getHome);

// Login Page
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogout);
// router.get("/", userController.loggedIn);

// User Details Page
router.get("/edit-user/:userId", userController.getEditUser);
router.post("/edit-user", userController.postEditUser);

// About Page
router.get("/about", userController.getAbout);

// Statistic Page
router.get(
  "/workingHourStatistic",
  isAuth,
  userController.getWorkingHourStatistic
);
router.get("/salaryStatistic", isAuth, userController.getSalaryStatistic);
router.get(
  "/workingHourStatistic-search",
  isAuth,
  userController.getWorkingHourStatisticSearch
);
router.get(
  "/salaryStatistic-search",
  isAuth,
  userController.getSalaryStatisticSearch
);

// Attendance Page
router.get("/attendance", isAuth, attendanceController.getAttendace);
router.get("/attendance-details", attendanceController.getAttendanceDetails);
router.post("/attendance", attendanceController.postAttendance);

// Absence Page
router.get("/absence", isAuth, absenceController.getAbsence);
router.get("/absence-details", isAuth, absenceController.getAbsenceDetails);
router.post("/absence", absenceController.postAbsence);

// Covid Page
router.get("/covid", isAuth, covidController.getCovid);
router.get("/covid-details", isAuth, covidController.getCovidDetails);
router.post("/covid", covidController.postCovid);
router.get(
  "/covid-details-staffs",
  isAuth,
  isManager,
  covidController.getCovidDetailsStaffs
);
router.get(
  "/covid-details-staffs/thong-tin-covid.pdf",
  isAuth,
  isManager,
  covidController.getPDF
);

router.get(
  "/approve-timesheet",
  isAuth,
  isManager,
  managerController.getApproveTimesheet
);
router.get(
  "/approve-timesheet-search",
  isAuth,
  isManager,
  managerController.getApproveTimesheetSearch
);

router.post("/approve-timesheet", managerController.postLockEmployee);
router.post(
  "/approve-timesheet-search",
  managerController.postDeleteWorkingRecord
);

module.exports = router;
