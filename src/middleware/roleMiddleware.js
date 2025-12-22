const authorization = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: Insufficient permission" });
    }
    next();
  };
};

module.exports = { authorization };
