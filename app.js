const express = require("express");
const app = express();
const helmet = require("helmet");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const logger = require("morgan");
const userRoute = require("./routes/user");
const adminRoute = require("./routes/admin");
const PORT = process.env.PORT || 5000;
const connectDB = require("./models/db");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

// Middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(logger("dev"));

// Routes
app.use("/api/auth", require("./Auth/route"));
app.use("/", userRoute);
app.use("/admin", adminRoute);

// View engine
app.set("view engine", "ejs");

// Database Connection
connectDB();

// Start the server
app.listen(PORT, () => console.log(`server started on ${PORT}`));

module.exports = app;

