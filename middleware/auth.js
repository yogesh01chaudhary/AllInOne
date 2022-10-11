const jwt = require("jsonwebtoken");
const User = require("../models/user");
exports.auth = async (req, res, next) => {
  try {
    let token = req.headers.authorization||req.headers['x-access-token'];
    if (!token) {
      return res
        .status(499)
        .send({ success: false, message: "Token not found" });
    }
    token = token.split(" ")[1];
    let data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: data.id };
    next();
  } catch (e) {
    return res.status(500).send({ success: false, error: e.name });
  }
};
