const express = require("express")
const router = express.Router()
const {adminAuth}=require("../middlewares/auth")
const {register,login,update,otp}=require("./auth")
router.route("/register").post(register)
router.route("/otp").post(otp)
router.route("/login").post(login)
router.route("/update").put(adminAuth,update)

module.exports = router