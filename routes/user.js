const express = require("express");
const userController = require("../controllers/user");
const covidController = require("../controllers/covid");
const absenceController = require("../controllers/absence");
const attendanceController = require("../controllers/attendance");
const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");
const router = express.Router();

// Home Page
router.get("/", userController.getHome);

// Login Page
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogout);
// router.get("/", userController.loggedIn);

// User Details Page
router.get("/edit-user/:userId", isAuth, userController.getEditUser);
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
router.get("/absence-details", absenceController.getAbsenceDetails);
router.post("/absence", absenceController.postAbsence);

// Covid Page
router.get("/covid", isAuth, covidController.getCovid);
router.get("/covid-details", isAuth, covidController.getCovidDetails);
router.post("/covid", covidController.postCovid);

module.exports = router;
