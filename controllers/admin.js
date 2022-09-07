const User = require("../models/user");

exports.getAddEmployee = (req, res, next) => {
  res.render("admin/add-employee", {
    pageTitle: "Thêm nhân viên",
    isAuthenticated: req.session.isLoggedIn,
    user: req.session.user,
  });
};

exports.postAddEmployee = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = "123456";
  const dob = req.body.dob;
  const startDate = req.body.startDate;
  const salaryScale = req.body.salaryScale;
  const department = req.body.department;
  const position = req.body.position;
  const annualLeave = req.body.annualLeave;
  const gender = req.body.gender;
  const imageUrl =
    gender === "Nam"
      ? "http://localhost:3333/images/male-icon.png"
      : "http://localhost:3333/images/female-icon.png";
  const employee = new User({
    name: name,
    email: email,
    password: password,
    dob: dob,
    startDate: startDate,
    salaryScale: salaryScale,
    department: department,
    position: position,
    annualLeave: annualLeave,
    image: imageUrl,
    gender: gender,
  });
  employee
    .save()
    .then((result) => {
      console.log("Create Employee");
      res.redirect("/admin/employees");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditEmployee = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const staff_Id = req.params.userId;
  User.findById(staff_Id)
    .then((employee) => {
      if (!employee) {
        return res.redirect("/");
      }
      res.render("admin/add-employee", {
        pageTitle: "Thay đổi thông tin nhân viên",
        editing: editMode,
        employee: employee,
        user: req.session.user,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditEmployee = (req, res, next) => {
  const staff_Id = req.body.productId;
  const updatedname = req.body.name;
  const updatedemail = req.body.email;
  const updateddoB = req.body.doB;
  const updatedstartDate = req.body.startDate;
  const updatedsalaryScale = req.body.salaryScale;
  const updateddepartment = req.body.department;
  const updatedposition = req.body.position;
  const updatedannualLeave = req.body.annualLeave;
  const updatedImageUrl = req.body.imageUrl;
  const updatedGender = req.body.gender;
  console.log(req.body);
  User.findById(staff_Id)
    .then((employee) => {
      employee.name = updatedname;
      employee.email = updatedemail;
      employee.doB = updateddoB;
      employee.startDate = updatedstartDate;
      employee.salaryScale = updatedsalaryScale;
      employee.department = updateddepartment;
      employee.position = updatedposition;
      employee.annualLeave = updatedannualLeave;
      employee.imageUrl = updatedImageUrl;
      employee.gender = updatedGender;
      return employee.save();
    })
    .then((result) => {
      console.log("UPDATED EMPLOYEE!");
      res.redirect("/admin/employees");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEmployees = (req, res, next) => {
  User.find()
    .lean()
    .then((employees) => {
      res.render("admin/employees", {
        employees: employees,
        pageTitle: "Danh sách nhân viên",
        isAuthenticated: req.session.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteEmployee = (req, res, next) => {
  const staffId = req.params._id;
  console.log(req.params);
  console.log(req.user);
  console.log(staffId);
  User.findByIdAndRemove(staffId) // findByIdAndRemove là phương thức có sẵn của mongoose
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/employees");
    })
    .catch((err) => {
      console.log(err);
    });
};
