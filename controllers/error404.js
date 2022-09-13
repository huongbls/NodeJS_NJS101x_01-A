// Get Page Error 404
exports.getError = (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.render("error404", {
      pageTitle: "Không tìm thấy trang",
      user: req.session.user,
      manager: req.user.position === "manager" ? true : false,
      admin: req.user.isAdmin === "Yes" ? true : false,
    });
  } else {
    res.redirect("/login");
  }
};
