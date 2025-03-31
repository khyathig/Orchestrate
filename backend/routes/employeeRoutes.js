const express = require("express");
const Employee = require("../models/Employee");
const authenticateUser = require("../middleware/authenticateUser");
const router = express.Router();

/**
 * @route GET /:email
 * @description Retrieves employee details based on the provided email.
 * @access Public
 * @param {string} email - The email of the employee to fetch.
 * @returns {Object} JSON response with employee details.
 * @returns {404} Employee not found if no employee is found with the given email.
 * @returns {500} Server error if there is an issue with the request.
 */

// Get employee by email
router.get("/:email", async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.params.email });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error.message);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

module.exports = router;
