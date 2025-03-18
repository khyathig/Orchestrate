const express = require("express");
const Task = require("../models/Task.js");
const User = require("../models/User.js");
const Event = require("../models/Event.js");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/event/:eventId", authMiddleware, async (req, res) => {
    try {
      const { eventId } = req.params;
      const tasks = await Task.find({ event: eventId }).populate("event");
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  router.post("/assign", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { taskName, assignedToEmail, deadline, budget, eventId } = req.body;
  
      const eventExists = await Event.findById(eventId);
      if (!eventExists) return res.status(404).json({ error: "Event not found" });
  
      const newTask = new Task({ taskName, assignedToEmail, deadline, budget, event: eventId });
      await newTask.save();
      res.json({ message: "Task assigned successfully", task: newTask });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get("/pending", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Please Login" });
        const tasks = await Task.find({ assignedToEmail: user.email, status: "Pending" }).populate("event");
        res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });
  

module.exports = router;
