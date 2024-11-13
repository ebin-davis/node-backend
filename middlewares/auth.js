const jwt = require("jsonwebtoken");
const dotenv=require('dotenv')
dotenv.config()
const jwtSecret =process.env.JWT
  exports.adminAuth = (req, res, next) => {
    console.log(req.cookies);
    const token = req.cookies.jwt;
    console.log("The token is "+token)
    if (!token) {
      return res.status(401).json({ message: "Not authorized, token not available" });
    }
  
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      }
      if (decodedToken.role !== "admin") {
        return res.status(403).json({ message: "Forbidden, not an admin" });
      }

      next();
    });
  };
exports.userAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  console.log(token);
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      } else {
        if (decodedToken.role !== "Basic") {
          return res.status(401).json({ message: "Not authorized" });
        } else {
          next();
        }
      }
    });
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, token not available" });
  }
};
