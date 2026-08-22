const jwt = require("jsonwebtoken");
const config = require("../config").get(process.env.ENV);
const response = require("./commonResponse");

async function verifyToken(req, res, next) {
  try {
    const token = req.headers["authorization"];
    console.log("came in verify token = ", token);
    const bearerToken = token.split(" ")[1].trim();
    if (bearerToken == "null") return response.send(res, 500, 3, "No token provided.", {});
    const tokenData = jwt.verify(bearerToken, config.jwt.secret);
    console.log("tokenData = ", tokenData);
    req.user_id = tokenData.id;
    req.role_id = tokenData.role_id;
    next();
  } catch (error) {
    console.log(error);
    return response.send(res, 500, 2, "Failed to authenticate token.", {});
  }
}
module.exports = verifyToken;
