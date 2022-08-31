// Get Page Error 404
exports.getError = (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.render("error404", {
      pageTitle: "Không tìm thấy trang",
      user: req.session.user,
    });
  } else {
    res.redirect("/login");
  }
};
