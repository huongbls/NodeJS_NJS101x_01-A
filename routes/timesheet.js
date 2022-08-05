const express = require("express");
const router = express.Router();

// Load model
const CheckIn = require("../models/CheckIn");
const Employee = require("../models/Employee");

//Thu nghiem
// router.get("/timesheet/checkIn", (req, res) => {
//   res.send("Day la router employee");
// });

// CheckIn.find()
//   .populate("employeeId")
//   .then((data) => {
//     console.log(data);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

//Hiển thị thông tin checkIn
router.get("/", async (req, res, next) => {
  const detailCheckIn = await CheckIn.find().lean().sort({ date: -1 });
  res.render("timesheet/index", { detailCheckIn });
});

// Hiện thị form để tạo bài viết mới
router.get("/check-in", (req, res, next) => {
  CheckIn.find()
    .populate("employeeId")
    .then((data) => {
      console.log(data);
      res.render("timesheet/checkIn");
    })
    .catch((err) => {
      console.log(err);
    });
});

//Tạo checkin mới
router.post("/", async (req, res, next) => {
  console.log(req.employee._id);
  const employeeId = req.employee._id;
  const { workingPlace, date } = req.body;
  const newCheckInData = { employeeId, workingPlace, date };
  const newCheckIn = new CheckIn(newCheckInData);
  await newCheckIn.save();
  // await newCheckIn.find().populate("employeeId").save();
  await CheckIn.find().populate("employeeId");
  // .then((data) => {
  //   console.log(data);
  //   res.render("timesheet/checkIn");
  // })
  // .catch((err) => {
  //   console.log(err);
  // });
  res.redirect("/timesheet");
});

module.exports = router;
