const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventType: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  description: { type: String },
  availableSlots: { type: Number, default: null },
  attendees: [{ type: String }], // Array of attendee emails
  team: { type: String },
  isPaid: { type: Boolean, default: false },
});

module.exports = mongoose.model("Event", eventSchema);
