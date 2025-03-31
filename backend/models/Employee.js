const mongoose = require("mongoose");

/**
 * @typedef {Object} Employee
 * @property {string} name - The name of the employee.
 * @property {string} email - The unique email of the employee.
 * @property {string} password - The hashed password of the employee.
 * @property {string} [team="General"] - The team to which the employee belongs.
 * @property {string} [role="employee"] - The role of the employee (default is "employee").
 */

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    team: { type: String, default: "General" },
    role: { type: String, default: "employee" }
});

/**
 * Mongoose model for Employee collection.
 * @type {mongoose.Model<Employee>}
 */

module.exports = mongoose.model("Employee", employeeSchema);
