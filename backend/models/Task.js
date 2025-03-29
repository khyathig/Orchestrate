const mongoose = require('mongoose');

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

module.exports = mongoose.model('Task', taskSchema);
