const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");

const userInfoRouter = require("./routes/userInfo");
const driveRouter = require("./routes/drive");

const app = express();

// set response headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

// use logger
app.use(logger("dev"));

// use bodyParser - json
app.use(bodyParser.json());

// use bodyParser - urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// use express-fileupload
app.use(fileUpload());

// use cookieparser
app.use(cookieParser());

// use "/api/userinfo", userInfoRouter
app.use("/api/userinfo", userInfoRouter);

// use "/api/drive", driveRouter
app.use("/api/drive", driveRouter);

// use error creator
app.use((req, res, next) => {
  next(createError(404));
});

// use error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.send(`ERROR ${err.status}: ${err.message}`);
});

module.exports = app;
