const Covid = require("../models/covid");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// Get Covid Page
exports.getCovid = (req, res, next) => {
  Covid.findOne({ userId: req.user._id })
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
        admin: req.user.isAdmin === "Yes" ? true : false,
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
  Covid.findOne({ userId: req.user._id })
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
  Covid.findOne({ userId: req.user._id })
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
        manager: req.user.position === "manager" ? true : false,
        admin: req.user.isAdmin === "Yes" ? true : false,
        covid: covid,
        active: { covid: true },
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// get covid details of staffs
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
  res.render("manager/covid-details-staffs", {
    pageTitle: "Thông tin Covid",
    user: req.session.user,
    manager: req.user.position === "manager" ? true : false,
    admin: req.user.isAdmin === "Yes" ? true : false,
    department: deptMembers[0].department,
    covid: covidStaffInfor,
    active: { covid: true },
    isAuthenticated: req.session.isLoggedIn,
  });
};

// export PDF covid details of staffs
exports.getPDF = async (req, res, next) => {
  let covidStaffInfor = [];
  const deptMembers = await User.find({
    department: req.user.department,
  }).lean();
  const covidResult = await Covid.find().lean();
  const date = new Date().toISOString().slice(0, 10);
  const pdfName =
    date + " Thong-tin-covid-phong-" + deptMembers[0].department + ".pdf";
  const pdfPath = path.join("data", "covid", pdfName);
  const file = fs.createWriteStream(pdfPath);
  const pdfDoc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=" + pdfName);

  pdfDoc.registerFont(
    "Roboto",
    "public/assets/fonts/RobotoCondensed-Light.ttf"
  );
  pdfDoc.registerFont(
    "Roboto-Bold",
    "public/assets/fonts/RobotoCondensed-Bold.ttf"
  );

  deptMembers.forEach((member) => {
    covidStaffInfor.push({
      _id: member._id,
      name: member.name,
      department: member.department,
      bodyTemperatures: [],
      vaccine: [],
      positive: [],
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
    .fontSize(20)
    .font("Roboto")
    .text("Thông tin Covid phòng " + req.user.department);
  covidStaffInfor.forEach((data) => {
    pdfDoc.fontSize(12).text("  ");
    pdfDoc.font("Roboto-Bold").text("Họ và tên: " + data.name);
    pdfDoc.font("Roboto").text("Nhiệt độ cơ thể");
    data.bodyTemperatures.forEach((temp) => {
      pdfDoc.text(
        "     Ngày: " +
          temp.date.toLocaleDateString() +
          "     Nhiệt độ: " +
          temp.value +
          " oC"
      );
    });
    pdfDoc.text("Tiêm vắcxin");
    data.vaccine.forEach((vaccine) => {
      pdfDoc.text(
        "     Ngày: " +
          vaccine.date.toLocaleDateString() +
          "     Mũi " +
          vaccine.injectedNo +
          " - " +
          vaccine.name
      );
    });
    pdfDoc.text("Dương tính Covid");
    data.positive.forEach((positive) => {
      pdfDoc.text(
        "     Ngày: " +
          positive.date.toLocaleDateString() +
          "     Dương tính Covid"
      );
    });
  });
  pdfDoc.end();
};
