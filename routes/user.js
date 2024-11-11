const express = require("express");
const router = express.Router();
const {userAuth}=require('../middlewares/auth')
router.get("/", (req, res) => res.render("home"))
router.get("/register", (req, res) => res.render("register"))
router.get("/otp",(req,res)=>res.render("otp"))
router.get("/login", (req, res) => res.render("login"))
router.get("/basic", userAuth, (req, res) => res.render("user"))
router.get("/logout", (req, res) => {
    res.cookie("jwt", "", { maxAge: "1" })
    res.redirect("/")
  })
module.exports = router;
