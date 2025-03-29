const Task = require("../models/Task");
const Employee = require("../models/Employee");
const Event = require("../models/Event");
const mongoose = require("mongoose");


// Get tasks assigned to the creator
exports.getTasks = async (req, res) => {
    try {
      const userEmail = req.headers["user-email"];
      console.log("Received request to fetch tasks for email:", userEmail);
  
      if (!userEmail) {
        console.error("Error: User email is missing in headers");
        return res.status(400).json({ message: "User email is required in headers" });
      }
  
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
  
      console.log(`Fetching tasks for ${userEmail}, Page: ${page}, Limit: ${limit}`);
  
      // Fetch tasks without using populate
      const tasks = await Task.find({ creator: userEmail })
        .sort({ deadline: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit);
  
      console.log("Fetched Tasks:", tasks);
      console.log("Fetched Tasks:", tasks.map(task => task.eventName));
      res.status(200).json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
      res.status(500).json({ message: "Error fetching tasks: " + error.message });
    }
  };
  

// Filter tasks by status or assignee
exports.filterTasks = async (req, res) => {
  const { status, assignee } = req.query;
  const query = {};

  if (status && ["Pending", "In Progress", "Completed"].includes(status)) query.status = status;
  if (assignee) query.assignee = assignee;

  console.log("Filtering tasks with query:", query);

  try {
    const filteredTasks = await Task.find(query);
    console.log("Filtered Tasks:", filteredTasks);
    res.status(200).json(filteredTasks);
  } catch (error) {
    console.error("Error filtering tasks:", error.message);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Get task details by ID
exports.getTaskDetails = async (req, res) => {
  try {
    console.log("Fetching task details for ID:", req.params.id);
    const task = await Task.findById(req.params.id);

    if (!task) {
      console.error("Task not found for ID:", req.params.id);
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("Task Details:", task);
    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task details:", error.message);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

exports.addCommentToTask = async (req, res) => {
  const { author, message } = req.body;
  console.log("Received comment request. Author:", author, "Message:", message);

  if (!author || !message) {
    console.error("Error: Author or message missing");
    return res.status(400).json({ message: "Author and message are required" });
  }

  try {
    console.log("Finding task by ID for adding comment:", req.params.id);
    const task = await Task.findById(req.params.id);

    if (!task) {
      console.error("Task not found for comment addition:", req.params.id);
      return res.status(404).json({ message: "Task not found" });
    }

    const newComment = {
      author,
      message,
      timestamp: new Date().toISOString(),
    };

    console.log("Adding new comment to task:", newComment);

    // Ensure comments array exists before pushing
    if (!Array.isArray(task.comments)) {
      task.comments = [];
    }

    task.comments.push(newComment);
    await task.save();

    console.log("Comment added successfully to task with ID:", req.params.id);
    res.status(201).json({ message: "Comment added successfully", task });
  } catch (error) {
    console.error("Error adding comment to task:", error.message);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

exports.getTaskComments = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ comments: task.comments || [] });
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

exports.getEventsByCreator = async (req, res) => {
  try {
    const userEmail = req.headers["user-email"];
    console.log("Received request to fetch events for email:", userEmail);

    if (!userEmail) {
      console.error("Error: User email is missing in headers");
      return res.status(400).json({ message: "User email is required in headers" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    console.log(`Fetching events for ${userEmail}, Page: ${page}, Limit: ${limit}`);

    // Fetch event IDs and event names where the creator matches the user's email
    const events = await Event.find({ creator: userEmail })
      .select("_id eventName") // Selecting event ID and event name
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    if (!events.length) {
      return res.status(404).json({ message: "No events found for this creator" });
    }

    console.log("Fetched Events:", events);

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error.message);
    res.status(500).json({ message: "Error fetching events: " + error.message });
  }
};

// Controller to fetch tasks for a specific event

exports.getTasksByEventID = async (req, res) => {
  try {
      const { eventID } = req.query;
      console.log("📥 Received eventID:", eventID);
      console.log("📌 Type of eventID:", typeof eventID);

      // Convert eventID to ObjectId
      if (!mongoose.Types.ObjectId.isValid(eventID)) {
          return res.status(400).json({ error: "Invalid eventID format" });
      }

      const objectId = new mongoose.Types.ObjectId(eventID);
      console.log("🔄 Converted eventID to ObjectId:", objectId);

      // Query tasks using converted ObjectId
      const tasks = await Task.find({ eventID: objectId });
      console.log("✅ Found tasks:", tasks);

      res.json(tasks);
  } catch (error) {
      console.error("❌ Error fetching tasks by eventID:", error);
      res.status(500).json({ error: "Server error" });
  }
};