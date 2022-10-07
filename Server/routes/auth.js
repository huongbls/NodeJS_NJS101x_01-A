const express = require("express");
const { query } = require("express-validator/check");

const User = require("../models/user");
const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post(
  "/signup",
  [
    query("fullname").trim().not().isEmpty(),
    query("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    query("password").trim().isLength({ min: 5 }),
    query("phone").trim().isNumeric(),
  ],
  authController.signup
);

router.post("/login", authController.login);

router.get("/:userId", authController.getDetailData);

router.get("/", authController.getAllData);

// router.get("/status", isAuth, authController.getUserStatus);

// router.patch(
//   "/status",
//   isAuth,
//   [body("status").trim().not().isEmpty()],
//   authController.updateUserStatus
// );

module.exports = router;
