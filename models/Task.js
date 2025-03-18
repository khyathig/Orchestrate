const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskName: { type: String, required: true },
  assignedToEmail: { type: String, required: true }, // Email of the assigned user
  deadline: { type: Date, required: true },
  budget: { type: Number, default: 0 },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true }, // Link to Event
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Task", taskSchema);
