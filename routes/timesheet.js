const express = require("express");
const router = express.Router();

// Load model
const CheckIn = require("../models/CheckIn");
const Employee = require("../models/Employee");

// CheckIn.find()
//   .populate("employeeId")
//   .then((data) => {
//     console.log(data);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

//Thu nghiem
// router.get("/timesheet/checkIn", (req, res) => {
//   res.send("Day la router employee");
// });

//Hiển thị thông tin checkIn
router.get("/", async (req, res, next) => {
  const detailCheckIn = await CheckIn.find().lean().sort({ date: -1 });
  res.render("timesheet/index", { detailCheckIn });
});

// Hiện thị form để tạo bài viết mới
router.get("/check-in", (req, res, next) => {
  res.render("timesheet/checkIn");
});

//Tạo post mới
router.post("/", async (req, res, next) => {
  console.log(req.employee._id);
  const employeeId = req.employee._id;
  const { workingPlace, date } = req.body;
  const newCheckInData = { employeeId, workingPlace, date };
  const newCheckIn = new CheckIn(newCheckInData);
  await newCheckIn.save();
  res.redirect("/timesheet");
});

CheckIn.find().populate("employeeId");

module.exports = router;
