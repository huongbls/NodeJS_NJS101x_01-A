const User = require("../models/user");

exports.getAddEmployee = (req, res, next) => {
  res.render("admin/add-employee", {
    pageTitle: "Thêm nhân viên",
    isAuthenticated: req.session.isLoggedIn,
    user: req.session.user,
    manager: req.user.position === "manager" ? true : false,
    admin: req.user.isAdmin === "Yes" ? true : false,
    active: { admin: true },
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
  const isAdmin = req.body.isAdmin;
  const imageUrl =
    gender === "Nam" ? "/images/male-icon.png" : "/images/female-icon.png";
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
    isAdmin: isAdmin,
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
  const staffId = req.query.id;
  User.findById(staffId)
    .lean()
    .then((employee) => {
      if (!employee) {
        return res.redirect("/");
      }
      res.render("admin/add-employee", {
        pageTitle: "Thay đổi thông tin nhân viên",
        editing: editMode,
        employee: employee,
        dob: new Date(employee.dob).toISOString().slice(0, 10),
        startDate: new Date(employee.startDate).toISOString().slice(0, 10),
        department: employee.department,
        position: employee.position,
        gender: employee.gender,
        isAdmin: employee.isAdmin,
        user: req.session.user,
        manager: req.user.position === "manager" ? true : false,
        admin: req.user.isAdmin === "Yes" ? true : false,
        active: { admin: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditEmployee = (req, res, next) => {
  const staffId = req.query.id;
  const updatedname = req.body.name;
  const updatedemail = req.body.email;
  const updateddoB = req.body.dob;
  const updatedstartDate = req.body.startDate;
  const updatedsalaryScale = req.body.salaryScale;
  const updateddepartment = req.body.department;
  const updatedposition = req.body.position;
  const updatedannualLeave = req.body.annualLeave;
  const updatedGender = req.body.gender;
  const updatedIsAdmin = req.body.isAdmin;
  console.log(req.body._id);
  console.log(updatedname);
  console.log(staffId);
  User.findById(staffId)
    .then((employee) => {
      console.log(employee);
      employee.name = updatedname;
      employee.email = updatedemail;
      employee.dob = updateddoB;
      employee.startDate = updatedstartDate;
      employee.salaryScale = updatedsalaryScale;
      employee.department = updateddepartment;
      employee.position = updatedposition;
      employee.annualLeave = updatedannualLeave;
      employee.gender = updatedGender;
      employee.isAdmin = updatedIsAdmin;
      return employee.save().then((result) => {
        console.log("UPDATED EMPLOYEE!");
        res.redirect("/admin/employees");
      });
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
        manager: req.user.position === "manager" ? true : false,
        admin: req.user.isAdmin === "Yes" ? true : false,
        active: { admin: true },
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteEmployee = (req, res, next) => {
  const staffId = req.query.id;
  User.findByIdAndRemove(staffId) // findByIdAndRemove là phương thức có sẵn của mongoose
    .then(() => {
      console.log("DESTROYED AN EMPLOYEE");
      res.redirect("/admin/employees");
    })
    .catch((err) => {
      console.log(err);
    });
};
