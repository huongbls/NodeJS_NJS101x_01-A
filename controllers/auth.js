const User = require("../models/user");

//get Login page
exports.getLogin = (req, res, next) => {
  res.render("login", {
    pageTitle: "Login",
    isAuthenticated: false,
    errorMessage: "",
  });
};

// post Login
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email, password: password })
    .then((user) => {
      if (!user) {
        return res.status(422).render("login", {
          pageTitle: "Login",
          errorMessage: "Username or Password not match!",
        });
      }
      req.session.isLoggedIn = true;
      req.session.user = user;
      return req.session.save((err) => {
        res.redirect(req.session.user.visitedPath || "/");
      });
    })
    .catch((err) => console.log(err));
};

// post Logout
exports.postLogout = (req, res, next) => {
  console.log("destroy", req.session.isLoggedIn);
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
