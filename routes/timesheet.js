const express = require("express");
const router = express.Router();

// Load model
const CheckIn = require("../models/CheckIn");
const Employee = require("../models/Employee");

Employee.findById("62e952a9ac7871d6e8098550")
  .populate("employeeId")
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });

//Thu nghiem
// router.get("/timesheet/checkIn", (req, res) => {
//   res.send("Day la router employee");
// });

// Hiện thị form để tạo bài viết mới
router.get("/check-in", (req, res) => {
  res.render("timesheet/checkIn");
});

//Tạo post mới
router.post("/", async (req, res) => {
  // console.log(req.body);
  // const newCheckInData = { workingPlace, date, employeeId };
  const newCheckIn = new CheckIn(req.body);
  await newCheckIn.save();
  res.redirect("/");
});

module.exports = router;
