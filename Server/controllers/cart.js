const User = require("../models/user");
const Product = require("../models/product");

exports.getCarts = async (req, res, next) => {
  const userId = req.query.idUser;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(user.cart.items);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteToCart = async (req, res, next) => {
  const userId = req.query.idUser;
  const productId = req.query.idProduct;
  let itemsArr = [];
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    user.cart.items.forEach((item) => {
      if (item.idProduct.toString() !== productId) {
        itemsArr.push(item);
      }
    });

    await User.findOneAndUpdate(
      { _id: userId },
      { $set: { cart: { items: itemsArr } } },
      { new: true }
    );
    console.log("delete");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putToCart = async (req, res, next) => {
  const userId = req.query.idUser;
  const productId = req.query.idProduct;
  const count = req.query.count;
  try {
    const user = await User.findById(userId);
    user.cart.items.forEach((item) => {
      if (item.idProduct.toString() === productId) {
        item.count = count;
      }
    });
    await user.save();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postToCart = async (req, res, next) => {
  const userId = req.query.idUser;
  const productId = req.query.idProduct;
  const count = +req.query.count;
  try {
    const user = await User.findById(userId);
    const product = await Product.findById(productId);
    const updatedCartItems = [...user.cart.items];
    const data = {
      idUser: user._id,
      idProduct: product._id,
      nameProduct: product.name,
      priceProduct: product.price,
      count: count,
      img: product.img1,
    };
    const cartProductIndex = user.cart.items.findIndex((cp) => {
      return cp.idProduct.toString() === productId;
    });

    if (cartProductIndex >= 0) {
      newCount = user.cart.items[cartProductIndex].count + count;
      updatedCartItems[cartProductIndex].count = newCount;
    } else {
      updatedCartItems.push(data);
    }
    const updatedCart = {
      items: updatedCartItems,
    };
    await User.findByIdAndUpdate(userId, { cart: updatedCart });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
