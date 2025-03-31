require("dotenv").config(); // Load environment variables
const express = require("express");
const {
    getTasks,
    filterTasks,
    getTaskDetails,
    addCommentToTask,
    getEventsByCreator,
    getTasksByEventID, 
    getTaskComments,
    getEventById,
    updateEvent,
} = require("../controllers/createdEventController");
const router = express.Router();

/**
 * @route GET /
 * @description Retrieves all tasks.
 * @access Public
 * @returns {Object} JSON response with all tasks.
 */

// Route to get all tasks
router.get("/",getTasks);

/**
 * @route GET /filter
 * @description Filters tasks by status or assignee.
 * @access Public
 * @param {string} [status] - Filter tasks by status (e.g., "Pending", "In Progress", "Completed").
 * @param {string} [assignee] - Filter tasks by the assignee's name or email.
 * @returns {Object} JSON response with filtered tasks.
 */

// Route to filter tasks by status or assignee
router.get("/filter", filterTasks);

/**
 * @route GET /created-events
 * @description Retrieves events created by the authenticated user (creator).
 * @access Public
 * @returns {Object} JSON response with events created by the user.
 */

router.get("/created-events", getEventsByCreator);

/**
 * @route GET /tasks
 * @description Retrieves tasks based on the associated event ID.
 * @access Public
 * @param {string} eventID - The ID of the event to fetch tasks for.
 * @returns {Object} JSON response with tasks related to the given event ID.
 */
// Route to get task details based on eventID
router.get("/tasks", getTasksByEventID);

/**
 * @route GET /:id
 * @description Retrieves the details of a specific task by its ID.
 * @access Public
 * @param {string} id - The ID of the task to fetch details for.
 * @returns {Object} JSON response with the task details.
 */

// Route to get task details by ID
router.get("/:id",getTaskDetails);

/**
 * @route POST /:id/comments
 * @description Adds a comment to a specific task.
 * @access Public
 * @param {string} id - The ID of the task to add the comment to.
 * @param {Object} req.body - The request body containing the comment.
 * @param {string} req.body.author - The author of the comment (email).
 * @param {string} req.body.message - The comment content.
 * @returns {Object} JSON response confirming the addition of the comment.
 */

// Route to add a comment to a task
router.post("/:id/comments", addCommentToTask);

/**
 * @route GET /:id/comments
 * @description Retrieves all comments associated with a specific task.
 * @access Public
 * @param {string} id - The ID of the task to fetch comments for.
 * @returns {Object} JSON response with the list of comments for the task.
 */

router.get("/:id/comments", getTaskComments);

module.exports = router;
