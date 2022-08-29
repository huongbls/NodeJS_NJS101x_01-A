const express = require("express");
const userController = require("../controllers/user");
const covidController = require("../controllers/covid");
const absenceController = require("../controllers/absence");
const attendanceController = require("../controllers/attendance");
const isAuth = require("../middleware/is-auth");
const router = express.Router();

// Login Page
router.get("/login", userController.getLogin);
router.post("/login", userController.postLogin);
router.post("/logout", userController.postLogout);
// router.get("/", userController.loggedIn);

// Home Page
router.get("/", userController.getHome);

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
router.get(
  "/attendance-details",
  isAuth,
  attendanceController.getAttendanceDetails
);
router.post("/attendance", attendanceController.postAttendance);

// Absence Page
router.get("/absence", isAuth, absenceController.getAbsence);
router.get("/absence-details", isAuth, absenceController.getAbsenceDetails);
router.post("/absence", absenceController.postAbsence);

// Covid Page
router.get("/covid", isAuth, covidController.getCovid);
router.get("/covid-details", isAuth, covidController.getCovidDetails);
router.post("/covid", covidController.postCovid);

module.exports = router;
