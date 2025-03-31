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

// Route to get all tasks
router.get("/",getTasks);

// Route to filter tasks by status or assignee
router.get("/filter", filterTasks);

router.get("/created-events", getEventsByCreator);
// Route to get task details based on eventID
router.get("/tasks", getTasksByEventID);

// Route to get task details by ID
router.get("/:id",getTaskDetails);

// Route to add a comment to a task
router.post("/:id/comments", addCommentToTask);

router.get("/:id/comments", getTaskComments);

module.exports = router;