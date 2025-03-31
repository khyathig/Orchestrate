const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

// Ensure JWT secret exists
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

/**
 * Middleware to authenticate users via JWT.
 * @param {Object} authRequest - The request object containing headers and cookies.
 * @param {Object} authResponse - The response object to send authentication errors.
 * @param {Function} nextMiddleware - The next function to continue request processing.
 */
const authenticateUser = async (authRequest, authResponse, nextMiddleware) => {
  try {
    const token =
      authRequest.cookies?.token ||
      authRequest.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return authResponse.status(401).json({ error: "Unauthorized: No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the user based on the decoded token's ID
    const authenticatedUser = await Employee.findById(decoded.id);
    if (!authenticatedUser) {
      return authResponse.status(401).json({ error: "Unauthorized: User not found." });
    }

    // Attach user data to request object
    authRequest.user = {
      id: authenticatedUser._id,
      email: authenticatedUser.email,
      name: authenticatedUser.name,
      role: authenticatedUser.role,
      team: authenticatedUser.team,
    };

    nextMiddleware();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    authResponse.status(401).json({ error: "Unauthorized: Invalid or expired token." });
  }
};

module.exports = authenticateUser;
