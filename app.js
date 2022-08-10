// Define Variables
const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const dbConnect = require("./ultil/database").mongooseConnect;
const userRoutes = require("./routes/user");
const User = require("./models/user");

// Import Controllers
const errorControllers = require("./controllers/error404");
const userController = require("./controllers/user");

const app = express();

// Define Template Engine
// app.set("view engine", "ejs");
// app.set("views", "views");
app.engine(
  "handlebars",
  exphbs({
    helpers: {
      add: function (value) {
        return value + 1;
      },
      tolocaledatestring: function (number) {
        return number.toLocaleDateString();
      },
      getHours: function (number) {
        return number.getHours();
      },
      getMinutes: function (number) {
        if (number.getMinutes() >= 10) {
          return number.getMinutes();
        } else {
          return `0${number.getMinutes()}`;
        }
      },
      subStract: function (number1, number2) {
        return ((number1 - number2) / 3.6e6).toFixed();
      },
      sum: function (number1, number2) {
        return number1 + number2;
      },
    },
  })
);
app.set("view engine", "handlebars");

// Check User is Logged In
app.use(userController.loggedIn);

// Define Static Folder
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

// Setting routes
app.use(userRoutes);
app.use(errorControllers.getError);

// Connect to MongoDB
dbConnect()
  .then((result) => {
    User.findOne()
      // .lean()
      .then((user) => {
        if (!user) {
          const user = new User({
            name: "Nguyễn Văn A",
            dob: new Date("2000-01-01"),
            salaryScale: 5000000,
            startDate: new Date("2022-05-31"),
            department: "IT",
            annualLeave: 5,
            image:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc_NEc8A16sOFBrLMoOcBUwFZlZ84A9UzfRw&usqp=CAU",
          });
          user.save();
        }
        app.listen(3000, () => {
          console.log("Server đã khởi động tại port 3000");
        });
      })
      .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));
