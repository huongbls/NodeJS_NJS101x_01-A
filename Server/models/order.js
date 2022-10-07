const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  orderList: {
    bill: [
      {
        products: [
          {
            idProduct: {
              type: Schema.Types.ObjectId,
              ref: "Product",
              required: true,
            },
            nameProduct: {
              type: String,
              required: true,
            },
            img: { type: String, required: true },
            priceProduct: { type: Number, required: true },
            idUser: { type: String, required: true },
            count: { type: Number, required: true },
          },
        ],
        idUser: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
        fullname: {
          type: String,
          required: true,
        },
        phone: {
          type: Number,
          required: true,
        },
        address: {
          type: String,
          require: true,
        },
        total: { type: Number, required: true },
      },
    ],
  },
});

module.exports = mongoose.model("Order", orderSchema);
