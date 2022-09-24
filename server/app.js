const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const handleError = require("./utilities/errorHandler");

const userInfoRouter = require("./routes/userInfo");
const driveRouter = require("./routes/drive");

const app = express();

// use cors policy
app.use(cors());

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

// use error handler
app.use(handleError(404));

module.exports = app;
