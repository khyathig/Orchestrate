const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

// Ensure JWT secret exists
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the user based on the decoded token's ID
    const user = await Employee.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found." });
    }

    // Attach user data to request object
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      team: user.team
    };

    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    res.status(401).json({ error: "Unauthorized: Invalid or expired token." });
  }
};

module.exports = authenticateUser;
