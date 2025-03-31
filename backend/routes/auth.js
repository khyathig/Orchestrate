const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const router = express.Router();

/**
 * JWT secret key for token generation.
 * Uses environment variable if available; otherwise, falls back to a default.
 * @constant {string}
 */

// Ensure JWT secret exists
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
if (!process.env.JWT_SECRET) {
  console.error("Warning: JWT_SECRET is missing in environment variables!");
}

/**
 * @route POST /login
 * @description Authenticates an employee and returns a JWT token.
 * @access Public
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body containing email and password.
 * @param {string} req.body.email - Employee's email.
 * @param {string} req.body.password - Employee's password.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response containing the user details and authentication token.
 */

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Employee.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Stored Hashed Password:", user.password);
      console.log("Entered Password:", password);
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password Match:", isMatch);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    // Store token in httpOnly cookie for security
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "Strict",
    });

    // Send token in response for frontend storage
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        team: user.team
      },
      token //Include token here
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

module.exports = router;
