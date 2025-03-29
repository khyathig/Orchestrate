import React, { useState, useEffect, useContext } from "react";
import { TaskContext } from "./TaskContext";
import { EventContext } from "./EventContext";
import { useNavigate } from "react-router-dom";
import TaskCard from "./TaskCard";
import "../../styles/Dashboard.css";

const Dashboard = () => {
    const { tasks, loadTasks, loading: taskLoading } = useContext(TaskContext);
    const {
        events,
        loadEvents,
        loading: eventLoading
    } = useContext(EventContext);

    const navigate = useNavigate();
    
    const [activeSection, setActiveSection] = useState("tasks"); // Default: Tasks Assigned
    const [taskFilter, setTaskFilter] = useState(""); 
    const [eventFilter, setEventFilter] = useState(""); 

    useEffect(() => {
        loadTasks();
        loadEvents();
    }, [loadTasks, loadEvents]);

    const filteredTasks = tasks.filter(task => {
        return taskFilter.trim() ? task.status.toLowerCase().includes(taskFilter.toLowerCase()) : true;
    });

    const filteredEvents = events.filter(event => {
        return eventFilter.trim() ? event.eventName.toLowerCase().includes(eventFilter.toLowerCase()) : true;
    });

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <button className={activeSection === "tasks" ? "active" : ""} onClick={() => setActiveSection("tasks")}>
                    Tasks Assigned
                </button>
                <button className={activeSection === "events" ? "active" : ""} onClick={() => setActiveSection("events")}>
                    Events Created
                </button>
            </aside>

            <div className="main-content">
                {activeSection === "tasks" ? (
                    <div className="section">
                        <h2>Tasks Assigned</h2>
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={taskFilter}
                            onChange={(e) => setTaskFilter(e.target.value)}
                        />
                        {taskLoading ? (
                            <p>Loading tasks...</p>
                        ) : (
                            <div className="task-list">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map(task => (
                                        <TaskCard key={task._id} task={task} onClick={() => navigate(`/task/${task._id}`)} />
                                    ))
                                ) : (
                                    <p>No tasks found.</p>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="section">
                        <h2>Events Created</h2>
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={eventFilter}
                            onChange={(e) => setEventFilter(e.target.value)}
                        />
                        {eventLoading ? (
                            <p>Loading events...</p>
                        ) : (
                            <div className="event-list">
                                {filteredEvents.length === 0 && <p>No events found.</p>}
                                {filteredEvents.map(event => (
                                    <div key={event._id} className="event-card">
                                        <h3>{event.eventName}</h3>
                                        <button onClick={() => navigate(`/event/${event._id}/tasks`)}>
                                            View Tasks
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
