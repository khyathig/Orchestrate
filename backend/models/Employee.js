const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    team: { type: String, default: "General" },
    role: { type: String, default: "employee" }
});

module.exports = mongoose.model("Employee", employeeSchema);