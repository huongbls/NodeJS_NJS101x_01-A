const Covid = require("../models/covid");

// Get Covid Page
exports.getCovid = (req, res, next) => {
  Covid.findOne({ userId: req.session.user._id })
    .lean()
    .then((covid) => {
      // Check if user has no covid data
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
      // Check type of covid-form (temperature, vaccine, positive)
      if (type === "temperature") {
        covid.bodyTemperatures.push({
          date: new Date(),
          value: req.body.temperature,
        });
      } else if (type === "positive") {
        covid.positive.push({ date: req.body.positive });
      } else {
        const { vaccineDate, vaccineName } = req.body;
        covid.vaccine.push({ name: vaccineName, date: vaccineDate });
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
  // Get Covid Details by User
  Covid.findOne({ userId: req.session.user._id })
    .lean()
    .then((covid) => {
      // Check if user has no covid data
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
