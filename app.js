// Define Variables
const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const dbConnect = require("./ultil/database").mongooseConnect;
const userRoutes = require("./routes/user");
const User = require("./models/user");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

// Import Controllers
const errorControllers = require("./controllers/error404");
const userController = require("./controllers/user");

const app = express();
const store = new MongoDBStore({
  uri: "mongodb+srv://huong:OiFcLLuMsc9aIYBh@asm1.7szamyk.mongodb.net/test",
  collection: "sessions",
});

// Define Template Engine
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
        return ((number1 - number2) / 3.6e6).toFixed(1);
      },
      sum: function (number1, number2) {
        return number1 + number2;
      },
      convertLeaveHourtoDay: function (hour) {
        return (hour / 8).toFixed(1);
      },
      ifCond: function (v1, operator, v2, options) {
        switch (operator) {
          case "==":
            return v1 == v2 ? options.fn(this) : options.inverse(this);
          case "===":
            return v1 === v2 ? options.fn(this) : options.inverse(this);
          case "!=":
            return v1 != v2 ? options.fn(this) : options.inverse(this);
          case "!==":
            return v1 !== v2 ? options.fn(this) : options.inverse(this);
          case "<":
            return v1 < v2 ? options.fn(this) : options.inverse(this);
          case "<=":
            return v1 <= v2 ? options.fn(this) : options.inverse(this);
          case ">":
            return v1 > v2 ? options.fn(this) : options.inverse(this);
          case ">=":
            return v1 >= v2 ? options.fn(this) : options.inverse(this);
          case "&&":
            return v1 && v2 ? options.fn(this) : options.inverse(this);
          case "||":
            return v1 || v2 ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      },
    },
  })
);
app.set("view engine", "handlebars");

// Check User is Logged In
// app.use(userController.loggedIn);
// app.use(userController.postLogin);

// app.use(morgan("combined"));

// Define Static Folder
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

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
            email: "admin@gmail.com",
            password: "123456",
            dob: new Date("2000-01-01"),
            salaryScale: 1.0,
            startDate: new Date("2022-05-31"),
            department: "IT",
            annualLeave: 12,
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
