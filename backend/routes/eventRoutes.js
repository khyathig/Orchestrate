const express = require("express");
const {
  createEvent,
  getEvents,
  confirmRSVP,
  unRSVP,        // Added unRSVP route
  getDetailedReport,
  getCompiledReport,
} = require("../controllers/eventController");
const authenticateUser = require("../middleware/authenticateUser");

const router = express.Router();

// Create an event
router.post("/", authenticateUser, createEvent);

// Get all current events
router.get("/", getEvents);

// RSVP to an event
router.post("/:id/rsvp",confirmRSVP); 

// Un-RSVP from an event
router.post("/:id/unrsvp", unRSVP); 

// Detailed and compiled reports
router.get("/detailedReport", getDetailedReport);
router.get("/compiledReport", getCompiledReport);

module.exports = router;