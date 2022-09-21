const express = require("express");
const adminController = require("../controllers/admin");
const isAdmin = require("../middleware/is-admin");
const visitedPath = require("../middleware/visitedpath");
const router = express.Router();

// /admin/add-product => GET
router.get(
  "/admin/add-employee",
  isAdmin,
  visitedPath,
  adminController.getAddEmployee
);
// /admin/add-product => POST
router.post("/admin/add-employee", isAdmin, adminController.postAddEmployee);
// /admin/products => GET
router.get(
  "/admin/employees",
  isAdmin,
  visitedPath,
  adminController.getEmployees
);

router.get(
  "/admin/edit-employee",
  isAdmin,
  visitedPath,
  adminController.getEditEmployee
);

router.post(
  "/admin/edit-employee",
  isAdmin,
  visitedPath,
  adminController.postEditEmployee
);

router.post(
  "/admin/delete-employee",
  isAdmin,
  visitedPath,
  adminController.postDeleteEmployee
);

module.exports = router;
