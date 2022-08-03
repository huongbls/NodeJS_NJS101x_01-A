const express = require("express"); //khai bao express
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const connectDB = require("./config/db");

//Nhap model Employee
const Employee = require("./models/Employee");

// Nhap khau routes
const posts = require("./routes/posts");
const admin = require("./routes/admin");
const timesheet = require("./routes/timesheet");

// Khoi dong app
const app = express();

// Khoi dong Handlebars middleware
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

// Khoi dong bodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Khoi dong methodOverride middleware
app.use(methodOverride("_method"));

// Khoi dong express middleware
app.use(express.json());

// Ket noi co so du lieu
connectDB();

// Mot so routes co ban, co the dua vao file rieng trong thu muc routes
app.get("/", (req, res) => res.render("index"));
app.get("/about", (req, res) => res.render("about"));
// app.get("/timesheet/checkIn", (req, res) => res.render("checkIn"));
app.get("/timesheet/checkOut", (req, res) => res.render("checkOut"));
app.get("/timesheet/takeLeave", (req, res) => res.render("takeLeave"));
app.get("/record", (req, res) => res.render("record"));
app.get("/covid19info", (req, res) => res.render("covid19info"));

// Mang routes vao de su dung (moi duong dan toi muc post duoc dua toi router users)
app.use("/posts", posts);
app.use("/admin", admin);
app.use("/timesheet", timesheet);

// Connect to MongoDB ==> làm sao để chuyển thành async
connectDB()
  .then((result) => {
    Employee.findOne()
      .then((user) => {
        if (!user) {
          const user = new Employee({
            staffId: "v001",
            fullname: "Nguyễn Thị Hường",
            doB: "1990-03-05",
            startDate: "2022-05-03",
            salaryScale: 8000000,
            department: "IT",
            annualLeave: 12,
            imageUrl:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqRmuWlNTWgpWM8vOBrXNi0HOUomECpBGr7uTTNTRpWoaAMAYq1xAshwMckSAyUTBJxtc&usqp=CAU",
          });
          user.save();
        }
        app.listen(3000, () => console.log(`Server da khoi dong`));
      })
      .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));
