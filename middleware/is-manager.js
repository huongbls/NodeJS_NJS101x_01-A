module.exports = (req, res, next) => {
  if (req.user.position !== "manager") {
    res.render("error404", {
      pageTitle: "Không tìm thấy trang",
      user: req.session.user,
      isAuthenticated: req.session.isLoggedIn,
    });
  }
  next();
};
