const jwt = require("jsonwebtoken");
const config = require("../config").get(process.env.ENV);
const response = require("./commonResponse");

async function optionalVerifyToken(req, res, next) {
  try {
    const token = req.headers["authorization"];
    if (!token) return next();

    const [scheme, bearerToken] = `${token}`.split(" ");
    if (scheme !== "Bearer" || !bearerToken || bearerToken === "null") {
      return response.send(res, 401, 3, "No token provided.", {});
    }

    const tokenData = jwt.verify(bearerToken, config.jwt.secret);
    req.user_id = tokenData.id;
    req.role_id = tokenData.role_id;
    return next();
  } catch (error) {
    const requestedUserId = Number(req.body?.userId || req.query?.userId || 0);
    if (!requestedUserId) return next();
    return response.send(res, 401, 2, "Failed to authenticate token.", {});
  }
}

module.exports = optionalVerifyToken;
