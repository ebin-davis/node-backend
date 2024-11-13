const express = require("express");
const router = express.Router();
const axios = require("axios");
const { userAuth } = require("../middlewares/auth");

router.get("/", (req, res) => res.render("home"));
router.get("/register", (req, res) => res.render("register"));

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const response = await axios.post("http://localhost:5000/api/auth/register", {
      username,
      password,
    });
    const data = response.data.user;
    req.session.userData = data;
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
    const response = await axios.post("http://localhost:5000/api/auth/otp", { otp },{withCredentials:true});
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
