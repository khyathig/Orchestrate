const Task = require("../models/Task");
const Employee = require("../models/Employee");
const Event = require("../models/Event");
const mongoose = require("mongoose");

/**
 * Controller to fetch tasks assigned to the creator.
 * This function fetches the tasks for a creator using their email.
 * 
 * @param {Object} taskRequest - The request object containing headers and query parameters.
 * @param {Object} taskResponse - The response object to send back the task results.
 * @returns {Object} - Returns a paginated list of tasks or an error message.
 */
exports.getTasks = async (taskRequest, taskResponse) => {
  try {
    // Extract user email from headers
    const userEmail = taskRequest.headers["user-email"];
    console.log("Received request to fetch tasks for email:", userEmail);

    // Validate if the user email is provided
    if (!userEmail) {
      console.error("Error: User email is missing in headers");
      return taskResponse.status(400).json({ message: "User email is required in headers" });
    }

    // Pagination settings (default to page 1 if not provided)
    const page = parseInt(taskRequest.query.page) || 1;
    const limit = 10;  // Limit the results to 10 tasks per page
    const skip = (page - 1) * limit;  // Calculate the number of tasks to skip

    console.log(`Fetching tasks for ${userEmail}, Page: ${page}, Limit: ${limit}`);

    // Fetch tasks assigned to the user without using populate
    const tasks = await Task.find({ creator: userEmail })
      .sort({ deadline: 1, createdAt: 1 })  // Sort tasks by deadline and creation date
      .skip(skip)  // Skip records for pagination
      .limit(limit);  // Limit the number of tasks returned

    console.log("Fetched Tasks:", tasks);
    console.log("Fetched Tasks Event Names:", tasks.map(task => task.eventName));
    
    // Return tasks to the client
    taskResponse.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    taskResponse.status(500).json({ message: "Error fetching tasks: " + error.message });
  }
};

/**
 * Controller to filter tasks by their status or assignee.
 * Filters tasks based on the query parameters: status and assignee.
 * 
 * @param {Object} taskRequest - The request object containing query parameters for filtering.
 * @param {Object} taskResponse - The response object to send back the filtered task results.
 * @returns {Object} - Returns the filtered list of tasks or an error message.
 */
exports.filterTasks = async (taskRequest, taskResponse) => {
  const { status, assignee } = taskRequest.query;
  const query = {};

  // Add status and assignee to the query if they are provided
  if (status && ["Pending", "In Progress", "Completed"].includes(status)) query.status = status;
  if (assignee) query.assignee = assignee;

  console.log("Filtering tasks with query:", query);

  try {
    // Fetch tasks based on the filter criteria
    const filteredTasks = await Task.find(query);
    console.log("Filtered Tasks:", filteredTasks);
    
    // Return the filtered tasks
    taskResponse.status(200).json(filteredTasks);
  } catch (error) {
    console.error("Error filtering tasks:", error.message);
    taskResponse.status(500).json({ message: "Server error: " + error.message });
  }
};

/**
 * Controller to fetch task details by ID.
 * This function retrieves the details of a task based on its ID.
 * 
 * @param {Object} taskRequest - The request object containing the task ID as a URL parameter.
 * @param {Object} taskResponse - The response object to send back the task details.
 * @returns {Object} - Returns the details of the task or an error message.
 */
exports.getTaskDetails = async (taskRequest, taskResponse) => {
  try {
    console.log("Fetching task details for ID:", taskRequest.params.id);
    
    // Fetch task by its ID
    const task = await Task.findById(taskRequest.params.id);

    // If task is not found, return a 404 error
    if (!task) {
      console.error("Task not found for ID:", taskRequest.params.id);
      return taskResponse.status(404).json({ message: "Task not found" });
    }

    console.log("Task Details:", task);
    
    // Return the task details
    taskResponse.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task details:", error.message);
    taskResponse.status(500).json({ message: "Server error: " + error.message });
  }
};

/**
 * Controller to add a comment to a specific task.
 * This function adds a comment to the task identified by its ID.
 * 
 * @param {Object} commentRequest - The request object containing the comment data (author and message).
 * @param {Object} commentResponse - The response object to send back the updated task or an error message.
 * @returns {Object} - Returns the task with the added comment or an error message.
 */
exports.addCommentToTask = async (commentRequest, commentResponse) => {
  const { author, message } = commentRequest.body;
  console.log("Received comment request. Author:", author, "Message:", message);

  // Validate if both author and message are provided
  if (!author || !message) {
    console.error("Error: Author or message missing");
    return commentResponse.status(400).json({ message: "Author and message are required" });
  }

  try {
    console.log("Finding task by ID for adding comment:", commentRequest.params.id);
    
    // Fetch task by ID
    const task = await Task.findById(commentRequest.params.id);

    // If task is not found, return a 404 error
    if (!task) {
      console.error("Task not found for comment addition:", commentRequest.params.id);
      return commentResponse.status(404).json({ message: "Task not found" });
    }

    // Create the new comment object
    const newComment = {
      author,
      message,
      timestamp: new Date().toISOString(),
    };

    console.log("Adding new comment to task:", newComment);

    // Ensure the task has a comments array before adding a new comment
    if (!Array.isArray(task.comments)) {
      task.comments = [];
    }

    // Add the new comment to the task
    task.comments.push(newComment);
    
    // Save the task with the new comment
    await task.save();

    console.log("Comment added successfully to task with ID:", commentRequest.params.id);
    
    // Return the updated task with the new comment
    commentResponse.status(201).json({ message: "Comment added successfully", task });
  } catch (error) {
    console.error("Error adding comment to task:", error.message);
    commentResponse.status(500).json({ message: "Server error: " + error.message });
  }
};

/**
 * Controller to fetch comments for a specific task.
 * This function retrieves all the comments associated with a task by its ID.
 * 
 * @param {Object} commentRequest - The request object containing the task ID as a URL parameter.
 * @param {Object} commentResponse - The response object to send back the task comments.
 * @returns {Object} - Returns the list of comments or an error message.
 */
exports.getTaskComments = async (commentRequest, commentResponse) => {
  try {
    const { id } = commentRequest.params;

    // Fetch the task by ID
    const task = await Task.findById(id);

    // If task is not found, return a 404 error
    if (!task) {
      return commentResponse.status(404).json({ message: "Task not found" });
    }

    // Return the task's comments or an empty array if no comments exist
    commentResponse.status(200).json({ comments: task.comments || [] });
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    commentResponse.status(500).json({ message: "Server error: " + error.message });
  }
};

/**
 * Controller to fetch events created by a specific user (creator).
 * It fetches a paginated list of events where the creator's email matches the user.
 * 
 * @param {Object} eventRequest - The request object containing the headers and query parameters.
 * @param {Object} eventResponse - The response object to send back the results.
 * @returns {Object} - Returns the list of events for the creator or an error message.
 */
exports.getEventsByCreator = async (eventRequest, eventResponse) => {
  try {
    // Extract user email from the headers
    const userEmail = eventRequest.headers["user-email"];
    console.log("Received request to fetch events for email:", userEmail);

    // Ensure the user email exists in headers
    if (!userEmail) {
      console.error("Error: User email is missing in headers");
      return eventResponse.status(400).json({ message: "User email is required in headers" });
    }

    // Handle pagination (default to page 1 if not provided)
    const page = parseInt(eventRequest.query.page) || 1;
    const limit = 10; // Limit the results to 10 per page
    const skip = (page - 1) * limit; // Skip records for pagination

    console.log(`Fetching events for ${userEmail}, Page: ${page}, Limit: ${limit}`);

    // Fetch event IDs and event names where the creator matches the user's email
    const events = await Event.find({ creator: userEmail })
      .select("_id eventName") // Select only event ID and event name
      .sort({ date: 1 }) // Sort events by date (ascending)
      .skip(skip) // Skip the appropriate number of records for pagination
      .limit(limit); // Limit the number of events returned

    // If no events are found, return a 404 error
    if (!events.length) {
      return eventResponse.status(404).json({ message: "No events found for this creator" });
    }

    console.log("Fetched Events:", events);

    // Return the list of events
    eventResponse.status(200).json(events);
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error fetching events:", error.message);
    eventResponse.status(500).json({ message: "Error fetching events: " + error.message });
  }
};

/**
 * Controller to fetch tasks related to a specific event based on the event ID.
 * This function retrieves tasks assigned to the event specified by the `eventID`.
 * 
 * @param {Object} taskRequest - The request object containing the query parameters.
 * @param {Object} taskResponse - The response object to send back the results.
 * @returns {Object} - Returns a list of tasks related to the event or an error message.
 */
exports.getTasksByEventID = async (taskRequest, taskResponse) => {
  try {
    // Extract eventID from the query parameters
    const { eventID } = taskRequest.query;
    console.log("📥 Received eventID:", eventID);
    console.log("📌 Type of eventID:", typeof eventID);

    // Check if the eventID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventID)) {
      return taskResponse.status(400).json({ error: "Invalid eventID format" });
    }

    // Convert the eventID to a MongoDB ObjectId
    const objectId = new mongoose.Types.ObjectId(eventID);
    console.log("🔄 Converted eventID to ObjectId:", objectId);

    // Query tasks related to the event with the specified eventID
    const tasks = await Task.find({ eventID: objectId });
    console.log("✅ Found tasks:", tasks);

    // Return the list of tasks for the event
    taskResponse.json(tasks);
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("❌ Error fetching tasks by eventID:", error);
    taskResponse.status(500).json({ error: "Server error" });
  }
};
