const jwt = require("jsonwebtoken");
var secret_key = "12344321";

module.exports = {
  sign: (payload) => {
    return jwt.sign(payload, secret_key);
  },

  verify: (req, res, next) => {
    var token = req.headers["x-access-token"];
    if (!token)
      return res
        .status(403)
        .json({ auth: false, message: "No token provided." });

    jwt.verify(token, secret_key, function (err, decoded) {
      if (err) {
        if (err.name == "TokenExpiredError") {
          return res
            .status(401)
            .json({ auth: false, message: "token expired" });
        } else {
          return res.status(500).json({ auth: false, message: err });
        }
      }

      // if everything good, save to request for use in other routes
      req.emailjwt = decoded.email;
      req.fullnamejwt = decoded.fullname;
      req.useridjwt = decoded.id;
      req.phonenumberjwt = decoded.phonenumber;
      next();
    });
  },

  isAdmin: (req, res, next) => {
    var token = req.headers["x-access-token"];
    if (!token)
      return res
        .status(403)
        .json({ auth: false, message: "No token provided." });

    jwt.verify(token, secret_key, function (err, decoded) {
      if (err) {
        if (err.name == "TokenExpiredError") {
          return res
            .status(401)
            .json({ auth: false, message: "token expired" });
        } else {
          return res.status(500).json({ auth: false, message: err });
        }
      }

      if (decoded.level == "admin") {
        //if everything good, save to request for use in other routes
        req.emailjwt = decoded.email;
        req.fullnamejwt = decoded.fullname;
        req.useridjwt = decoded.id;
        req.phonenumberjwt = decoded.phonenumber;
        req.leveljwt = decoded.level;
        next();
      } else {
        res.status(501).json({ message: "Unauthorized" });
      }
    });
  },
};
