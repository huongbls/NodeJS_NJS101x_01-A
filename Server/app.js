const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const checkoutRoutes = require("./routes/checkout");
const cartRoutes = require("./routes/cart");
const historyRoutes = require("./routes/histories");
const chatroomRoutes = require("./routes/chatroom");
const { v4: uuidv4 } = require("uuid");

const app = express();

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4());
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(cors());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/", productRoutes);
app.use("/users", authRoutes);
app.use("/carts", cartRoutes);
app.use("/email", checkoutRoutes);
app.use("/histories", historyRoutes);
app.use("/chatrooms", chatroomRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://admin:b56pSqlM4t4XPX05@funixasm3.hikmeel.mongodb.net/shop?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
  )
  .then((result) => {
    console.log("Connect to DB");
    const server = app.listen(5000, () => {
      console.log("Server is running at port 5000");
    });
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      // console.log("Client connected_" + socket.id);
      // socket.on("disconnect", () => {
      //   console.log("Disconnnect " + socket.id);
      // });
      socket.on("send_message", (data) => {
        console.log(data);
      });
      socket.on("hello", (data) => {
        console.log(data);
      });
    });
  })
  .catch((err) => console.log(err));
