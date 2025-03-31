require("dotenv").config();
const express = require("express");
const Task = require("../models/Task");
const { 
  updateTaskStatus, 
  getTasksByAssignee, 
  getTaskById, 
  addCommentToTask_Assignee 
} = require("../controllers/taskController");
const authenticateUser = require("../middleware/authenticateUser");

const router = express.Router();


/**
 * @route GET /
 * @description Fetches all tasks with only the eventID and status.
 * @access Public
 * @returns {Array} JSON response containing the list of tasks with eventID and status.
 * @returns {500} Server error if there is an issue fetching tasks.
 */

//Corrected: Get all tasks (Fixed route path)
router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find({}, "eventID status"); // Fetch only eventID & status
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Server error fetching tasks" });
    }
});

/**
 * @route PATCH /:taskId/status
 * @description Updates the status of a specific task.
 * @access Private
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} req - Express request object containing the new task status.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with updated task details.
 * @returns {400} Bad request if the task status cannot be updated.
 * @returns {500} Server error if there is an issue updating the task status.
 */

//Correct route: Update task status
router.patch("/:taskId/status", updateTaskStatus);

/**
 * @route GET /assigned
 * @description Retrieves tasks assigned to the logged-in user.
 * @access Private
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Array} JSON response with tasks assigned to the logged-in user.
 * @returns {500} Server error if there is an issue fetching tasks.
 */

//Correct route: Get tasks assigned to the logged-in user
router.get("/assigned", getTasksByAssignee);

/**
 * @route GET /assigned/:taskId
 * @description Retrieves details of a specific task assigned to the logged-in user.
 * @access Private
 * @param {string} taskId - The ID of the task to retrieve.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with task details.
 * @returns {404} Not found if the task is not found.
 * @returns {500} Server error if there is an issue fetching task details.
 */

//Correct route: Get details of a specific assigned task by ID
router.get("/assigned/:taskId", getTaskById);

/**
 * @route POST /assigned/:taskId/comments
 * @description Adds a comment to an assigned task.
 * @access Private
 * @param {string} taskId - The ID of the task to add a comment to.
 * @param {Object} req - Express request object containing the comment.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the added comment details.
 * @returns {500} Server error if there is an issue adding the comment.
 */

//Correct route: Add a comment to an assigned task
router.post("/assigned/:taskId/comments", addCommentToTask_Assignee);

module.exports = router;
