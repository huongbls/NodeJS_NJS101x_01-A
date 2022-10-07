const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const User = require("../models/user");
const Order = require("../models/order");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const emailTemplate = fs.readFileSync(
  path.join(__dirname, "../templates/index.handlebars"),
  "utf-8"
);

handlebars.registerHelper("multiple", function (value1, value2) {
  return value1 * value2;
});

const template = handlebars.compile(emailTemplate);

const options = {
  auth: {
    api_key: API_KEY, //cannot public into github
  },
};

const mailer = nodemailer.createTransport(sgTransport(options));

exports.postEmail = async (req, res, next) => {
  const to = req.query.to;
  const fullname = req.query.fullname;
  const phone = req.query.phone;
  const address = req.query.address;
  const userId = req.query.idUser;
  const user = await User.findById(userId).lean();
  const cartItem = user.cart.items;

  function getTotal(carts) {
    let sub_total = 0;
    const sum_total = carts.map((value) => {
      return (sub_total += parseInt(value.priceProduct * value.count));
    });
    return sub_total;
  }

  const totalPrice = getTotal(cartItem);

  // console.log(cartItem);

  const messageBody = template({
    fullname: fullname,
    userId: userId,
    phone: phone,
    address: address,
    cartItem: cartItem,
    totalPrice: totalPrice,
  });

  // console.log(messageBody);

  const email = {
    to: to,
    from: "huong050390@hotmail.com",
    subject: `Xác nhận đơn đặt hàng ngày ${new Date().toLocaleDateString()} 
      (${new Date().toTimeString()})`,
    html: messageBody,
  };

  // mailer.sendMail(email, function (err, res) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   console.log(res);
  // });

  if (await Order.findOne({ userId: userId })) {
    const order = await Order.findOne({ userId: userId });
    const bill = order.orderList.bill;
    const newBill = [
      {
        products: cartItem,
        idUser: userId,
        fullname: fullname,
        phone: phone,
        address: address,
        total: totalPrice,
      },
    ];
    const updateBill = [...bill, ...newBill];
    await Order.findOneAndUpdate(
      { userId: userId },
      { orderList: { bill: updateBill } },
      { new: true }
    );
  } else {
    const order = new Order({
      userId: userId,
      orderList: {
        bill: [
          {
            products: cartItem,
            idUser: userId,
            fullname: fullname,
            phone: phone,
            address: address,
            total: totalPrice,
          },
        ],
      },
    });
    await order.save();
  }

  await User.findByIdAndUpdate(userId, { cart: { items: [] } });
};
