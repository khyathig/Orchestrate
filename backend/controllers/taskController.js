const Task = require("../models/Task");
const mongoose = require("mongoose");

// Get tasks assigned to the logged-in user
exports.getTasksByAssignee = async (taskRequest, taskResponse) => {
  try {
    const userEmail = taskRequest.headers["user-email"];

    if (!userEmail) {
      console.error("Missing user-email in headers.");
      return taskResponse.status(400).json({ message: "User email is required in headers" });
    }

    console.log("User Email Received:", userEmail);

    // Fetch tasks where the assignee matches the logged-in user
    const tasks = await Task.find({ assignee: userEmail }).sort({ deadline: 1, createdAt: 1 });

    if (tasks.length === 0) {
      console.warn("No tasks found for:", userEmail);
      return taskResponse.status(404).json({ message: "No tasks found for this employee" });
    }

    console.log(`Successfully fetched ${tasks.length} tasks for: ${userEmail}`);
    taskResponse.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.stack);
    taskResponse.status(500).json({ message: "Error fetching tasks: " + error.message });
  }
};

// Update task status (using taskId from URL)
exports.updateTaskStatus = async (taskRequest, taskResponse) => {
  try {
    const { status } = taskRequest.body;
    const { taskId } = taskRequest.params; // ✅ Use taskId instead of id

    console.log(`Received request to update task: ${taskId} to status: ${status}`);

    if (!taskId || !status) {
      console.warn("Task ID or status missing in request");
      return taskResponse.status(400).json({ message: "Task ID and status are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      console.warn("Invalid Task ID:", taskId);
      return taskResponse.status(400).json({ message: "Invalid Task ID format" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: { status } },
      { new: true }
    );

    if (!updatedTask) {
      console.warn(`Task not found for ID: ${taskId}`);
      return taskResponse.status(404).json({ message: "Task not found" });
    }

    console.log(`Task ${taskId} successfully updated to '${status}'`);
    taskResponse.status(200).json({ message: "Task status updated", task: updatedTask });
  } catch (error) {
    console.error("Error updating task status:", error.message);
    taskResponse.status(500).json({ message: "Error updating task status: " + error.message });
  }
};

// Get task details by taskId
exports.getTaskById = async (taskRequest, taskResponse) => {
  try {
    const { taskId } = taskRequest.params; // ✅ Use taskId instead of id

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      console.warn("Invalid Task ID:", taskId);
      return taskResponse.status(400).json({ message: "Invalid Task ID format" });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      console.warn("Task not found for ID:", taskId);
      return taskResponse.status(404).json({ message: "Task not found" });
    }

    console.log(`Task details fetched for Task ID: ${taskId}`);
    taskResponse.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task details:", error.message);
    taskResponse.status(500).json({ message: "Error fetching task details: " + error.message });
  }
};

// Add a comment to a task
exports.addCommentToTask_Assignee = async (commentRequest, commentResponse) => {
  try {
    const userEmail = commentRequest.headers["user-email"]; // Logged-in user
    const { message } = commentRequest.body;
    const { taskId } = commentRequest.params; // ✅ Use taskId instead of id

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      console.warn("Invalid Task ID:", taskId);
      return commentResponse.status(400).json({ message: "Invalid Task ID format" });
    }

    if (!userEmail || !message) {
      console.warn("Missing user-email or message");
      return commentResponse.status(400).json({ message: "User email and message are required" });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      console.warn("Task not found for ID:", taskId);
      return commentResponse.status(404).json({ message: "Task not found" });
    }

    // Append comment
    const newComment = {
      author: userEmail,
      message,
      timestamp: new Date().toISOString(),
    };

    task.comments.push(newComment);
    await task.save();

    console.log(`Comment added by ${userEmail} on Task ID: ${taskId}`);
    commentResponse.status(201).json({ message: "Comment added successfully", task });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    commentResponse.status(500).json({ message: "Server error: " + error.message });
  }
};
