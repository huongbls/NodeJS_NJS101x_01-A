const express = require("express");
const router = express.Router();

// Load model
const Employee = require("../models/Employee");

//Hiển thị tất cả bài viết
router.get("/", async (req, res) => {
  const employees = await Employee.find().lean();
  res.render("admin/index", { employees });
});

// Hiện thị form để thêm nhân viên
router.get("/add-employee", (req, res) => {
  res.render("admin/add-employee");
});

//Tạo nhân viên mới
router.post("/", async (req, res) => {
  console.log(req.body);
  const {
    staffId,
    fullname,
    doB,
    startDate,
    salaryScale,
    department,
    annualLeave,
    imageUrl,
  } = req.body;
  try {
    const newEmployeeData = {
      staffId: staffId,
      fullname: fullname,
      doB: doB,
      startDate: startDate,
      salaryScale: salaryScale,
      department: department,
      annualLeave: annualLeave,
      imageUrl: imageUrl,
    };
    const newEmployee = new Employee(newEmployeeData);
    await newEmployee.save();
    res.redirect("/admin");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
