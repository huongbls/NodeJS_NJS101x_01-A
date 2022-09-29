const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator/check");

// const io = require("../socket");
const Product = require("../models/product");
const User = require("../models/user");

exports.getProducts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 5;
  try {
    const totalItems = await Product.find().countDocuments();
    const products = await Product.find()
      .populate("userId")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Fetched products successfully.",
      products: products,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getProductDetail = async (req, res, next) => {
  const prodId = req.params.prodId;
  try {
    const product = await Product.findById(prodId);
    res.status(200).json({
      message: "Fetched a product successfully.",
      product: product,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getProductsPagination = async (req, res, next) => {
  const currentPage = +req.query.page || 1;
  const perPage = 5;
  try {
    const totalItems = await Product.find().countDocuments();
    const products = await Product.find()
      //   .populate("userId")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Fetched products pagination successfully.",
      products: products,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getProductsCategory = async (req, res, next) => {
  const category = req.query.category;
  try {
    const products = await Product.find({ category: category });
    res.status(200).json({
      message: "Fetched products category successfully.",
      products: products,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
