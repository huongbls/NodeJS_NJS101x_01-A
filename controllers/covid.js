const Covid = require("../models/covid");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// Get Covid Page
exports.getCovid = (req, res, next) => {
  Covid.findOne({ userId: req.session.user._id })
    .lean()
    .then((covid) => {
      if (!covid) {
        const newCovid = new Covid({
          userId: req.session.user._id,
          bodyTemperatures: [],
          vaccine: [],
          positive: [],
        });
        return newCovid.save();
      }
      return covid;
    })
    .then((covid) => {
      res.render("covid", {
        pageTitle: "Thông tin Covid",
        user: req.session.user,
        manager: req.user.position === "manager" ? true : false,
        vaccine: covid.vaccine,
        active: { covid: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// Post Covid Details Page
exports.postCovid = (req, res, next) => {
  const type = req.query.type;
  console.log(req.body.temperature);
  Covid.findOne({ userId: req.session.user._id })
    .then((covid) => {
      if (type === "temperature") {
        covid.bodyTemperatures.push({
          date: new Date(),
          value: req.body.temperature,
        });
      } else if (type === "positive") {
        covid.positive.push({ date: req.body.positive });
      } else {
        const { injectedNo, vaccineDate, vaccineName } = req.body;
        covid.vaccine.push({
          injectedNo: injectedNo,
          name: vaccineName,
          date: vaccineDate,
        });
      }
      return covid.save();
    })
    .then((covid) => {
      res.redirect("/covid-details");
    })
    .catch((err) => console.log(err));
};

// Get Covid Details Page
exports.getCovidDetails = (req, res, next) => {
  Covid.findOne({ userId: req.session.user._id })
    .lean()
    .then((covid) => {
      if (covid) {
        return covid;
      } else {
        const newCovid = new Covid({
          userId: req.session.user._id,
          bodyTemperatures: [],
          vaccine: [],
          positive: [],
        });
        return newCovid.save();
      }
    })
    .then((covid) => {
      res.render(`covid-details`, {
        pageTitle: "Thông tin Covid",
        user: req.session.user,
        covid: covid,
        active: { covid: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCovidDetailsStaffs = async (req, res, next) => {
  let covidStaffInfor = [];
  const deptMembers = await User.find({
    department: req.user.department,
  }).lean();
  const covidResult = await Covid.find().lean();
  deptMembers.forEach((member) => {
    covidStaffInfor.push({
      _id: member._id,
      name: member.name,
      department: member.department,
    });
  });
  covidStaffInfor.forEach((object) => {
    covidResult.forEach((result) => {
      if (object._id.toString() === result.userId.toString()) {
        Object.assign(object, {
          bodyTemperatures: result.bodyTemperatures,
          vaccine: result.vaccine,
          positive: result.positive,
        });
      }
    });
  });
  console.log(covidStaffInfor);
  res.render("covid-details-staffs", {
    pageTitle: "Thông tin Covid",
    user: req.session.user,
    department: deptMembers[0].department,
    covid: covidStaffInfor,
    active: { covid: true },
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getPDF = async (req, res, next) => {
  let covidStaffInfor = [];
  const deptMembers = await User.find({
    department: req.user.department,
  }).lean();
  const covidResult = await Covid.find().lean();
  const pdfName = "thongtincovid.pdf";
  const pdfPath = path.join("data", "covid", pdfName);
  const file = fs.createWriteStream(pdfPath);
  const pdfDoc = new PDFDocument();
  pdfDoc.registerFont(
    "Roboto",
    "../public/assets/fonts/RobotoCondensed-Light.ttf"
  );

  deptMembers.forEach((member) => {
    covidStaffInfor.push({
      _id: member._id,
      name: member.name,
      department: member.department,
    });
  });
  covidStaffInfor.forEach((object) => {
    covidResult.forEach((result) => {
      if (object._id.toString() === result.userId.toString()) {
        Object.assign(object, {
          bodyTemperatures: result.bodyTemperatures,
          vaccine: result.vaccine,
          positive: result.positive,
        });
      }
    });
  });

  pdfDoc.pipe(file);
  pdfDoc.pipe(res);
  pdfDoc
    .fontSize(26)
    .font("Roboto")
    .text("Thông tin Covid phòng " + req.user.department);
  pdfDoc.fontSize(12).text("  ");
  covidStaffInfor.forEach((data) => {
    pdfDoc.font("Roboto").text("Họ và tên: " + data.name);
    pdfDoc.text("Nhiet do co the");
    data.bodyTemperatures.forEach((temp) => {
      pdfDoc.text(
        "     Ngay: " +
          temp.date.toLocaleDateString() +
          "     Nhiet do: " +
          temp.value +
          " oC"
      );
    });
    pdfDoc.text("Tiem vacxin");
    data.vaccine.forEach((vaccine) => {
      pdfDoc.text(
        "     Ngay: " +
          vaccine.date.toLocaleDateString() +
          "     Mui " +
          vaccine.injectedNo +
          " - " +
          vaccine.name
      );
    });
    pdfDoc.text("Duong tinh covid");
    data.positive.forEach((positive) => {
      pdfDoc.text(
        "     Ngay: " +
          positive.date.toLocaleDateString() +
          "     Duong tinh Covid"
      );
    });
    pdfDoc.fontSize(12).text("  ");
  });
  // pdfDoc.text("---------------");
  pdfDoc.end();
};
