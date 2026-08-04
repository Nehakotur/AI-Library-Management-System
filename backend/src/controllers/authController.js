const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    user.password = undefined;

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check User
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    // Generate Token
    // Generate Access Token (short-lived)
    const accessToken = jwt.sign(
     { id: user._id, role: user.role },
     process.env.JWT_SECRET,
     { expiresIn: "15m" }
    );

    // Generate Refresh Token (long-lived)
    const refreshToken = jwt.sign(
     { id: user._id },
     process.env.JWT_REFRESH_SECRET,
     { expiresIn: "7d" }
    );

    // Refresh token ko database mein save karo
    user.refreshToken = refreshToken;
    await user.save();
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token: accessToken,
      refreshToken,
      data: user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Refresh Access Token
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Refresh token verify karo
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // User dhoondo aur check karo refresh token match karta hai
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Naya access token banao
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      success: true,
      token: newAccessToken,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

// Forgot Password - reset token generate karo
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Random token generate karo
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Token ko hash karke save karo (security ke liye)
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 10 minute ka expiry
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Abhi ke liye token seedha response mein bhej rahe hain (baad mein email se bhejenge)
    res.status(200).json({
      success: true,
      message: "Reset token generated",
      resetToken: resetToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reset Password - naya password set karo
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Jo token bheja hai usko hash karo, compare karne ke liye
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Aisa user dhoondo jiska token match ho aur abhi expire na hua ho
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Naya password hash karke save karo
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
};