const express = require("express");

const User = require("../models/user");
const productController = require("../controllers/product");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/products", productController.getProducts);

router.get("/products/:prodId", productController.getProductDetail);

router.get("/products-pagination", productController.getProductsPagination);

router.get("/products-search", productController.getProductsCategory);

module.exports = router;
