const express = require("express");
const { query } = require("express-validator/check");

const User = require("../models/user");
const checkoutController = require("../controllers/checkout");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post("/", checkoutController.postEmail);

module.exports = router;
