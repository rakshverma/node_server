require("dotenv").config().parsed;
const express = require("express");
const compression = require("compression");
const httpError = require("http-errors");
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const xss = require("xss-clean");
const appRoutes = require("./src/routes");
const { createSignedUrl } = require("./src/utils/supabaseStorage");
const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3005,http://localhost:3006,http://localhost,https://localhost,capacitor://localhost,ionic://localhost")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAllOrigins =
  allowedOrigins.includes("*") && process.env.CORS_ALLOW_ALL === "true" && process.env.NODE_ENV !== "production";
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowAllOrigins || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "x-access-token"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: false, message: "Too many attempts. Please try again later." },
});

function isSafeStoragePath(filePath) {
  return (
    typeof filePath === "string" &&
    filePath.length <= 500 &&
    !filePath.startsWith("/") &&
    !filePath.includes("\\") &&
    !filePath.split("/").includes("..") &&
    /^[a-zA-Z0-9/_.,@ -]+$/.test(filePath)
  );
}

app.listen(port, () => {
  console.log("listening on port ", port);
});

app.use(compression());
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(xss());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(morgan("combined"));
app.use(["/admin/auth/login", "/admin/auth/register", "/admin/auth/forgotpassword", "/auth/login", "/auth/register", "/auth/forgotpassword"], authLimiter);
app.get(["/uploads/*", "/upload/*"], async (req, res) => {
  try {
    const filePath = req.params[0];
    if (!isSafeStoragePath(filePath)) return res.status(404).send({ error: "File not found" });
    const signedUrl = await createSignedUrl(filePath);
    return res.redirect(signedUrl);
  } catch (error) {
    console.error("Storage redirect failed");
    return res.status(404).send({ error: "File not found" });
  }
});
app.use(function (req, res, next) {
  next();
});

app.use(appRoutes); // calling all the routes

app.use(function (req, res, next) {
  next(httpError(404));
});

app.use(function (err, req, res, next) {
  console.error("Request failed", { method: req.method, status: err.status || 500 });
  res.status(err.status || 500).send({ error: "Request: Not Found" });
});

module.exports = app;
