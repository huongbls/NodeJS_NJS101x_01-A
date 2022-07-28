const mongoose = require("mongoose"); //nhập mongoose

const Schema = mongoose.Schema; //Tạo hằng số Schema nơi chúng ta truy cập vào mongooseSchema

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    //Tham chiếu đến model user
  },
});

module.exports = mongoose.model("Order", orderSchema);
// Xuất một model dựa trên Schema đó với monogoose model,
// Đặt tên cho nó là Order và do đó collection có tên là orders
