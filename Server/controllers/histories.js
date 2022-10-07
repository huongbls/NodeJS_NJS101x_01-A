const Order = require("../models/order");

exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.query.idUser;
    const order = await Order.findOne({ userId: userId });
    res.status(200).json(order.orderList.bill);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getDetails = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);
    const order = await Order.findOne({
      "orderList.bill._id": id,
    });
    order.orderList.bill.forEach((item) => {
      if (item._id.toString() === id) {
        res.status(200).json({ information: item, cart: item.products });
      }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
