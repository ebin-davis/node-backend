const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const jwtSecret = process.env.JWT;
exports.register = async (req, res, next) => {
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
    // Respond with success
    return res.status(200).json({
      message: "User successfully created",
      token,
      user,
    });
  } catch (error) {
    // Handle any errors
    return res.status(400).json({
      message: "User was not successfully created",
      error: error.message,
    });
  }
};

exports.otp = async (req, res, next) => {
  const { otp } = req.body;
  if (otp === "1234") {
    return res.status(200).json({
      message: "Otp verification completed",
    });
  } else {
    return res.status(400).json({
      message: "Otp is incorrect",
    });
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Username or Password not present",
    });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        message: "Login not successful",
        error: "User not found",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Login not successful",
        error: "Incorrect password",
      });
    }
    const maxAge = 3 * 60 * 60;
    const token = jwt.sign(
      { id: user._id, username, role: user.role },
      jwtSecret,
      {
        expiresIn: maxAge, // 3hrs in sec
      }
    );
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000, // 3hrs in ms
    });
    res.status(200).json({
      message: "Login successful",
      user: user._id,
    });
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.update = async (req, res, next) => {
  const { role, id } = req.body;

  // Verify if role and id are present
  if (!role || !id) {
    return res.status(400).json({ message: "Role or Id not present" });
  }

  // Verify if the role is 'admin'
  if (role !== "admin") {
    return res.status(400).json({ message: "Role is not admin" });
  }

  try {
    const user = await User.findById(id);

    // Check if user exists and role is not already 'admin'
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "User is already an Admin" });
    }

    // Update role and save user
    user.role = role;
    await user.save();

    res.status(200).json({ message: "Update successful", user });
  } catch (error) {
    res
      .status(400)
      .json({ message: "An error occurred", error: error.message });
  }
};
exports.getUsers = async (req, res, next) => {
  await User.find({})
    .then((users) => {
      const userFunction = users.map((user) => {
        const container = {};
        container.username = user.username;
        container.role = user.role;
        return container;
      });
      res.status(200).json({ user: userFunction });
    })
    .catch((err) =>
      res.status(401).json({ message: "Not successful", error: err.message })
    );
};
