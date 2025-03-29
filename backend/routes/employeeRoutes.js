const express = require("express");
const Employee = require("../models/Employee");
const authenticateUser = require("../middleware/authenticateUser");
const router = express.Router();

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
