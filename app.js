const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("62e246901d8aecb91f3188c7") // findById là phương thức được cung cấp bởi mongoose
    .then((user) => {
      req.user = user; //lấy lại user và lưu trữ user trong request
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://test:Nj28g2UmFeAYdDAe@funixnjs101xcluster.hlmi1es.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then((result) => {
    User.findOne().then((user) => {
      //findOne() không đưa vào tham số, thì nó trả về người đầu tiên mà nó tìm thấy
      if (!user) {
        const user = new User({
          // Tạo một user trước khi lắng nghe
          name: "Max",
          email: "max@gmail.com",
          items: [],
        });
        user.save();
      }
    });
    app.listen(3000); //lang nghe cac request den
  })
  .catch((err) => {
    console.log(err); // ghi lai bat ky loi tiem an nao co the gap khi ket noi
  });
