require("dotenv").config().parsed;
const express = require("express");
const compression = require("compression");
const httpError = require("http-errors");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const xss = require("xss-clean");
const appRoutes = require("./src/routes");
const { createSignedUrl } = require("./src/utils/supabaseStorage");
const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3005,http://localhost:3006")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", "x-access-token"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.listen(port, () => {
  console.log("listening on port ", port);
});

app.use(compression());
app.use(helmet());
app.use(xss());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(morgan("combined"));
app.get("/uploads/*", async (req, res) => {
  try {
    const filePath = req.params[0];
    if (!filePath) return res.status(404).send({ error: "File not found" });
    const signedUrl = await createSignedUrl(filePath);
    return res.redirect(signedUrl);
  } catch (error) {
    console.log("Storage redirect error = ", error);
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
  console.log("Error " + err, "Req " + req.method + " " + req.protocol + "://" + req.get("host") + req.originalUrl);
  res.status(err.status || 500).send({ error: "Request: Not Found" });
});

module.exports = app;
