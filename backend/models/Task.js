const mongoose = require('mongoose');

/**
 * @typedef {Object} Comment
 * @property {string} author - The email of the comment author.
 * @property {string} message - The content of the comment.
 * @property {Date} [timestamp] - The time when the comment was added (defaults to current time).
 */

/**
 * @typedef {Object} Task
 * @property {string} taskName - The name of the task.
 * @property {string} description - A brief description of the task.
 * @property {string} eventName - The name of the associated event.
 * @property {mongoose.Types.ObjectId} eventID - The ID of the associated event.
 * @property {"Pending" | "In Progress" | "Completed"} [status="Pending"] - The status of the task.
 * @property {number} [budget] - The budget allocated for the task.
 * @property {string} creator - The email of the task creator.
 * @property {string} assignee - The email of the employee assigned to the task.
 * @property {Date} [deadline] - The deadline for task completion.
 * @property {Comment[]} [comments] - A list of comments related to the task.
 */

const taskSchema = new mongoose.Schema({
  taskName: { type: String, required: true },
  description: { type: String, required: true },
  eventName: { type: String, required: true }, // Keeping eventName for reference
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, //  event ID field
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  budget: { type: Number, default: null },
  creator: { type: String, required: true }, // Storing email directly
  assignee: { type: String, required: true }, // Storing email directly
  deadline: { type: Date, default: null },
  comments: [
    {
      author: { type: String, required: true }, // Comment author's email
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
}, { timestamps: true });

/**
 * Mongoose model for the Task collection.
 * @type {mongoose.Model<Task>}
 */

module.exports = mongoose.model('Task', taskSchema);
