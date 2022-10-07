const express = require("express");
const { query } = require("express-validator/check");

const User = require("../models/user");
const cartController = require("../controllers/cart");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", cartController.getCarts);

router.post("/add", cartController.postToCart);

router.put("/update", cartController.putToCart);

router.delete("/delete", cartController.deleteToCart);

module.exports = router;
