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

/**
 * @route POST /
 * @description Creates a new event.
 * @access Private
 * @param {Object} req - Express request object containing event details.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the created event details.
 * @returns {500} Server error if there is an issue with creating the event.
 */

// Create an event
router.post("/", authenticateUser, createEvent);

/**
 * @route GET /
 * @description Retrieves all current events.
 * @access Public
 * @returns {Array} JSON response containing the list of current events.
 * @returns {500} Server error if there is an issue fetching events.
 */

// Get all current events
router.get("/", getEvents);

/**
 * @route POST /:id/rsvp
 * @description Allows a user to RSVP to an event.
 * @access Public
 * @param {string} id - The ID of the event to RSVP to.
 * @returns {Object} JSON response confirming the RSVP.
 * @returns {400} Bad request if RSVP fails (e.g., already RSVPed).
 * @returns {500} Server error if there is an issue with RSVP.
 */

// RSVP to an event
router.post("/:id/rsvp",confirmRSVP); 

/**
 * @route POST /:id/unrsvp
 * @description Allows a user to un-RSVP from an event.
 * @access Public
 * @param {string} id - The ID of the event to un-RSVP from.
 * @returns {Object} JSON response confirming the un-RSVP.
 * @returns {400} Bad request if un-RSVP fails (e.g., not previously RSVPed).
 * @returns {500} Server error if there is an issue with un-RSVP.
 */

// Un-RSVP from an event
router.post("/:id/unrsvp", unRSVP); 

/**
 * @route GET /detailedReport
 * @description Retrieves a detailed report of events.
 * @access Private
 * @returns {Object} JSON response with a detailed report of events.
 * @returns {500} Server error if there is an issue generating the report.
 */

// Detailed and compiled reports
router.get("/detailedReport", getDetailedReport);

/**
 * @route GET /compiledReport
 * @description Retrieves a compiled report of events.
 * @access Private
 * @returns {Object} JSON response with a compiled report of events.
 * @returns {500} Server error if there is an issue generating the report.
 */
router.get("/compiledReport", getCompiledReport);

module.exports = router;
