const User = require("../models/user");

exports.getAddEmployee = (req, res, next) => {
  res.render("admin/add-employee", {
    pageTitle: "Thêm nhân viên",
    isAuthenticated: req.session.isLoggedIn,
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
  const annualLeave = req.body.annualLeave;
  const imageUrl = "https://www.w3schools.com/bootstrap4/img_avatar3.png";
  const employee = new User({
    name: name,
    email: email,
    password: password,
    dob: dob,
    startDate: startDate,
    salaryScale: salaryScale,
    department: department,
    annualLeave: annualLeave,
    image: imageUrl,
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
  const updatedannualLeave = req.body.annualLeave;
  const updatedImageUrl = req.body.imageUrl;
  console.log(req.body);
  User.findById(staff_Id)
    .then((employee) => {
      employee.name = updatedname;
      employee.email = updatedemail;
      employee.doB = updateddoB;
      employee.startDate = updatedstartDate;
      employee.salaryScale = updatedsalaryScale;
      employee.department = updateddepartment;
      employee.annualLeave = updatedannualLeave;
      employee.imageUrl = updatedImageUrl;
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
