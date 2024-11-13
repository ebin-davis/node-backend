const express = require("express");
const router = express.Router();
const axios = require("axios");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const jwtSecret = process.env.JWT;

const registerMiddleware = async (req, res, next) => {
  const { username, password } = req.body;
  console.log("register" + req.body);
  if (password.length < 6) {
    return res.status(400).json({ message: "Password less than 6 characters" });
  }
  try {
    // Hash the password
    const hash = await bcrypt.hash(password, 10);

    // Create the user with the hashed password
    const user = await User.create({
      username,
      password: hash,
    });
    const maxAge = 3 * 60 * 60;
    const token = jwt.sign(
      { id: user._id, username, role: user.role },
      jwtSecret,
      {
        expiresIn: maxAge, // 3hrs in sec
      }
    );
    console.log("token in register route ", token);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000, // 3hrs in ms
    });

    req.session.userData = user;
    next();
    // Respond with success
  } catch (error) {
    // Handle any errors
    return res.status(400).json({
      message: "User was not successfully created",
      error: error.message,
    });
  }
};

router.get("/", (req, res) => res.render("home"));
router.get("/register", (req, res) => res.render("register"));

router.post("/register", registerMiddleware, async (req, res) => {
  try {
    console.log("Cookies:", req.cookies.jwt);
    res.redirect("/otp");
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message,
        error: error.response.data.error,
      });
    } else {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
});

router.get("/otp", (req, res) => {
  const userData = req.session.userData;
  if (!userData) return res.redirect("/register"); // Redirect if no userData is present
  res.render("otp", { userData });
});

router.post("/otp", async (req, res) => {
  const { otp } = req.body;
  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/otp",
      { otp },
      { withCredentials: true }
    );
    console.log("after otp axios");
    const otpData = response.data;
    if (!req.session.userData) return res.redirect("/login");

    if (req.session.userData.role === "Basic") {
      res.redirect("/basic");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log("OTP verification failed:", error.message);
    res.redirect("/otp"); // Redirect back to OTP page on error
  }
});

router.get("/login", (req, res) => res.render("login"));
router.get("/basic", userAuth, (req, res) => res.render("user"));
router.get("/logout", (req, res) => {
  req.session.destroy(); // Clear session on logout
  res.redirect("/");
});

module.exports = router;
