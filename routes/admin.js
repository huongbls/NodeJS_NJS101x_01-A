const express = require("express");
const adminController = require("../controllers/admin");
const router = express.Router();

// /admin/add-product => GET
router.get("/add-employee", adminController.getAddEmployee);
// /admin/add-product => POST
router.post("/add-employee", adminController.postAddEmployee);
// /admin/products => GET
router.get("/employees", adminController.getEmployees);

router.get("/edit-employee/:userId", adminController.getEditEmployee);

router.post("/edit-employee", adminController.postEditEmployee);

router.post("/delete-employee", adminController.postDeleteEmployee);

module.exports = router;
