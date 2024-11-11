const express = require("express");
const router = express.Router();
const {adminAuth}=require('../middlewares/auth')
router.get("/admin", adminAuth, (req, res) => res.render("admin"))
router.get("/logout", (req, res) => {
    res.cookie("jwt", "", { maxAge: "1" })
    res.redirect("/")
  })
module.exports = router;