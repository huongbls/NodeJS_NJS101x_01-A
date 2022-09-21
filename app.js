// Define Variables
const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const dbConnect = require("./ultil/database").mongooseConnect;
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
// const visitedPath = require("./middleware/visitedpath");
const User = require("./models/user");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const multer = require("multer");

// Import Controllers
const errorControllers = require("./controllers/error404");

const app = express();
const store = new MongoDBStore({
  uri: "mongodb+srv://huong:OiFcLLuMsc9aIYBh@asm1.7szamyk.mongodb.net/test",
  collection: "sessions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  // destination: "./images",
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().slice(0, 10) + "-" + file.originalname);
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

// app.use(morgan("combined"));

// Define Static Folder
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use(express.static(path.join(__dirname, "public")));
// app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// Setting routes
app.use(userRoutes);
app.use(adminRoutes);
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
            position: "manager",
            annualLeave: 12,
            image: "http://localhost:3333/images/male-icon.png",
            gender: "Nam",
            isAdmin: "Yes",
          });
          user.save();
        }
        app.listen(process.env.PORT || 8080, "0.0.0.0", () => {
          console.log("Server đã khởi động tại port 8080");
        });
      })
      .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));
