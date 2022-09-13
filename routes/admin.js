const express = require("express");
const adminController = require("../controllers/admin");
const isAdmin = require("../middleware/is-admin");
const router = express.Router();

// /admin/add-product => GET
router.get("/add-employee", isAdmin, adminController.getAddEmployee);
// /admin/add-product => POST
router.post("/add-employee", isAdmin, adminController.postAddEmployee);
// /admin/products => GET
router.get("/employees", isAdmin, adminController.getEmployees);

router.get("/edit-employee", isAdmin, adminController.getEditEmployee);

router.post("/edit-employee", isAdmin, adminController.postEditEmployee);

router.post("/delete-employee", isAdmin, adminController.postDeleteEmployee);

module.exports = router;
