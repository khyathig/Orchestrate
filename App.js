import React, { useState } from "react";
import axios from "axios";

function App() {
    const [pendingTasks, setPendingTasks] = useState([]);
    const [error, setError] = useState("");

    const fetchPendingTasks = async () => {
        try {
            const response = await axios.get("http://localhost:5000/pending_tasks");
            console.log("✅ Fetched data:", response.data); // Debugging
            setPendingTasks(response.data);
            setError(""); // Clear errors if successful
        } catch (error) {
            console.error("❌ Error fetching tasks:", error);
            setError("Failed to fetch tasks. Please try again.");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Task Manager</h2>
            <button onClick={fetchPendingTasks}>Show Pending Tasks</button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div>
                {pendingTasks.length > 0 ? (
                    <ul>
                        {pendingTasks.map(task => (
                            <li key={task._id}>
                                <strong>{task.name}:</strong> {task.title}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No pending tasks</p>
                )}
            </div>
        </div>
    );
}

export default App;
