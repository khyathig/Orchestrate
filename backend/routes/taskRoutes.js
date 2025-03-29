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

//Correct route: Update task status
router.patch("/:taskId/status", updateTaskStatus);

//Correct route: Get tasks assigned to the logged-in user
router.get("/assigned", getTasksByAssignee);

//Correct route: Get details of a specific assigned task by ID
router.get("/assigned/:taskId", getTaskById);

//Correct route: Add a comment to an assigned task
router.post("/assigned/:taskId/comments", addCommentToTask_Assignee);

module.exports = router;
