const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();  
app.use(cors({ origin: "http://localhost:3000" }));  
app.use(express.json());

// ✅ Define Task Schema & Model (Move Outside mongoose.connect)
const TaskSchema = new mongoose.Schema({
    name: String,
    title: String,
    status: String
});

const Task = mongoose.model("Task", TaskSchema);

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,  // Handle slow connections
})
.then(async () => {
    console.log("✅ MongoDB Atlas Connected");

    // ✅ Insert Dummy Data Only If Empty
    async function insertDummyData() {
        const existingTasks = await Task.countDocuments();
        if (existingTasks > 0) {
            console.log("⚠ Dummy data already exists. Skipping insertion.");
            return;
        }

        await Task.insertMany([
            { name: "Alice", title: "Finish report", status: "pending" },
            { name: "Alice", title: "Fix UI bugs", status: "completed" },
            { name: "Bob", title: "Submit assignment", status: "pending" },
            { name: "Charlie", title: "Prepare slides", status: "pending" },
            { name: "Charlie", title: "Update documentation", status: "completed" }
        ]);
        console.log("✅ Dummy Data Inserted");
    }

    insertDummyData();  // Call only once

}).catch(err => console.error("❌ MongoDB Connection Failed:", err));

// ✅ API to get only pending tasks
app.get("/pending_tasks", async (req, res) => {
    try {
        const tasks = await Task.find({ status: "pending" });

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: "No pending tasks found" });
        }

        console.log("✅ Fetched Pending Tasks:", tasks);  // Debugging
        res.json(tasks);
    } catch (error) {
        console.error("❌ Error fetching tasks:", error);
        res.status(500).json({ message: "Error fetching tasks", error: error.message });
    }
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
