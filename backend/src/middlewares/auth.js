const jwt = require("jsonwebtoken");
const env = require("../config/env");

const protect = (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { _id: payload.id, id: payload.id, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };

const adminOnly = authorize("admin");

module.exports = { protect, authorize, adminOnly };
