const User = require("../models/user");

module.exports = async (req, res, next) => {
  const updateVisitedPath = await User.findByIdAndUpdate(req.user._id, {
    visitedPath: req.url,
  });
  next();
};
