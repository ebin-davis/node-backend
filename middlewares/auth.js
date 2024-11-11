const jwt = require("jsonwebtoken");
const jwtSecret =
  "393601b1104589646c50d779577c18181cc51ee37cf35bb4762ca7823d7e5a7fd4036e";
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
