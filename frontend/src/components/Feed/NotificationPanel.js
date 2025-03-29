import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../../utils/socket"; 
import "../../styles/NotificationPanel.css";
import { Bell, MessageSquare, Calendar } from "lucide-react"; // Icons

// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function NotificationPanel({ loggedInUser }) {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Token not found. Please log in again.");
                return;
            }
            try {
                const res = await axios.get(`${API_BASE_URL}/api/tasks/assigned`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "user-email": loggedInUser.email,
                    },
                });
                console.log("Fetched Assigned Tasks:", res.data);

                // **Filter out completed tasks**
                const activeTasks = res.data.filter(task => task.status !== "Completed");
                setTasks(activeTasks);
            } catch (error) {
                console.error("Error fetching assigned tasks:", error);
            }
        };

        fetchTasks();

        // WebSocket for real-time updates
        socket.on("newTask", (task) => {
            if (task.assignee === loggedInUser.email && task.status !== "Completed") {
                console.log("🔄 New Task Received:", task);
                setTasks((prevTasks) => {
                    const isDuplicate = prevTasks.some((prevTask) => prevTask._id === task._id);
                    return isDuplicate ? prevTasks : [...prevTasks, task];
                });
            }
        });

        socket.on("newComment", (commentData) => {
            const { taskId, author, message } = commentData;
            console.log("💬 New Comment Received:", commentData);

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === taskId && task.status !== "Completed"
                        ? { ...task, comments: [...(task.comments || []), { author, message }] }
                        : task
                )
            );
        });

        socket.on("newEvent", (eventData) => {
            console.log("📢 New Event Notification:", eventData);
            
            if (eventData.eventType === "firm-wide" || eventData.team === loggedInUser.team) {
                setTasks((prevTasks) => {
                    const isDuplicate = prevTasks.some((prevTask) => prevTask._id === eventData._id);
                    return isDuplicate ? prevTasks : [...prevTasks, eventData];
                });
            }
        });

        return () => {
            socket.off("newTask");
            socket.off("newComment");
            socket.off("newEvent");
        };
    }, [loggedInUser.email, loggedInUser.team]);

    return (
        <div className="notification-panel">
            <h3 className="notification-header">
                <Bell className="bell-icon" /> Notifications
            </h3>

            {tasks.length === 0 ? (
                <p className="no-notifications">🎉 No new notifications!</p>
            ) : (
                <ul className="notification-list">
                    {tasks.map((task) => (
                        <li key={task._id || Math.random()} className="notification-card">
                            <div className="notification-icon">
                                {task.taskName ? <MessageSquare size={20} /> : <Calendar size={20} />}
                            </div>
                            <div className="notification-content">
                                <p className="notification-title"><strong>{task.taskName || task.eventName}</strong></p>
                                <p className="notification-description">{task.description || "New Event Available!"}</p>
                                {task.deadline && <p className="notification-deadline">📅 {new Date(task.deadline).toLocaleDateString()}</p>}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default NotificationPanel;
