const mongoose = require("mongoose");

/**
 * @typedef {Object} Event
 * @property {string} eventName - The name of the event.
 * @property {"firm-wide" | "limited-entry" | "team-specific"} eventType - The type of event.
 * @property {Date} [date] - The optional date of the event.
 * @property {string} [venue] - The optional venue of the event.
 * @property {string} description - A brief description of the event.
 * @property {number} [availableSlots] - The number of available slots (only for limited-entry events).
 * @property {number} [ticketPrice] - The ticket price (only for limited-entry events).
 * @property {number} [totalBudget] - The total allocated budget for the event.
 * @property {string[]} [attendees] - The list of employee emails who have registered for the event.
 * @property {string} [team=""] - The team associated with the event (if applicable).
 * @property {boolean} [isPaid=false] - Indicates whether the event is a paid event.
 * @property {string} creator - The ID or email of the employee who created the event.
 */

const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    eventType: { type: String, enum: ["firm-wide", "limited-entry", "team-specific"], required: true },
    date: { type: Date }, // Optional event date
    venue: { type: String }, // Optional venue
    description: { type: String, required: true },
    availableSlots: { type: Number }, // Only required for limited-entry events, validated at application level
    ticketPrice: { type: Number }, // Only for limited-entry events, validated at application level
    totalBudget: { type: Number },
    attendees: { type: [String], default: [] },
    team: { type: String, default: "" },
    isPaid: { type: Boolean, default: false },
    creator: {type: String,required: true,}
});

/**
 * Mongoose model for the Event collection.
 * @type {mongoose.Model<Event>}
 */

module.exports = mongoose.model("Event", eventSchema);
