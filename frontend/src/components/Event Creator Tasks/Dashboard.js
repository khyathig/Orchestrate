// Dashboard.js
/**
 * Dashboard Component
 * 
 * This component serves as the main dashboard displaying tasks assigned to the user
 * and events created by the user. It includes task and event filtering, navigation,
 * and dynamic content loading.
 * 
 * Features:
 * - Task and event filtering based on search input
 * - Task and event navigation
 * - Sidebar for switching between tasks and events
 * - Uses TaskContext and EventContext for global state management
 */

import React, { useState, useEffect, useContext } from "react";        // Import hooks for state management and lifecycle
import { TaskContext } from "./TaskContext";                           // Import TaskContext for task data
import { EventContext } from "./EventContext";                         // Import EventContext for event data
import { useNavigate } from "react-router-dom";                        // Import navigation hook
import TaskCard from "./TaskCard";                                     // Import TaskCard component
import "../../styles/Dashboard.css";                                   // Import CSS for styling

const Dashboard = () => {
    const { tasks, loadTasks, loading: taskLoading } = useContext(TaskContext);    // Get tasks and loading state from context
    const {
        events,                                                        // Get events and loading state from EventContext
        loadEvents,
        loading: eventLoading
    } = useContext(EventContext);

    const navigate = useNavigate();                                    // Hook for programmatic navigation

    const [activeSection, setActiveSection] = useState("tasks");       // State to toggle between "tasks" and "events" sections
    const [taskFilter, setTaskFilter] = useState("");                  // State for task filtering
    const [eventFilter, setEventFilter] = useState("");                // State for event filtering

    useEffect(() => {
        loadTasks();                                                   // Load tasks on component mount
        loadEvents();                                                  // Load events on component mount
    }, [loadTasks, loadEvents]);                                       // Dependencies: fetch functions

    // ✅ Filter tasks by status
    const filteredTasks = tasks.filter(task => {
        return taskFilter.trim()                                       // Apply filter only if input is not empty
            ? task.status.toLowerCase().includes(taskFilter.toLowerCase()) 
            : true;                                                    // Display all tasks if no filter is applied
    });

    // ✅ Filter events by name
    const filteredEvents = events.filter(event => {
        return eventFilter.trim()                                      // Apply filter only if input is not empty
            ? event.eventName.toLowerCase().includes(eventFilter.toLowerCase()) 
            : true;                                                    // Display all events if no filter is applied
    });

    return (
        <div className="dashboard-container">                          {/* Main container for the dashboard */}
            
            {/* ✅ Sidebar Section */}
            <aside className="sidebar">
                <button 
                    className={activeSection === "tasks" ? "active" : ""}  // Highlight active section
                    onClick={() => setActiveSection("tasks")}             // Set active section to "tasks"
                >
                    Tasks Assigned
                </button>
                <button 
                    className={activeSection === "events" ? "active" : ""} // Highlight active section
                    onClick={() => setActiveSection("events")}            // Set active section to "events"
                >
                    Events Created
                </button>
            </aside>

            {/* ✅ Main Content Section */}
            <div className="main-content">

                {/* ✅ Display Tasks Section */}
                {activeSection === "tasks" ? (
                    <div className="section">
                        <h2>Tasks Assigned</h2>

                        {/* ✅ Task Search Input */}
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={taskFilter}
                            onChange={(e) => setTaskFilter(e.target.value)}   // Update task filter state
                        />

                        {taskLoading ? (                                   // Show loading indicator if tasks are loading
                            <p>Loading tasks...</p>
                        ) : (
                            <div className="task-list">
                                {filteredTasks.length > 0 ? (              // Render task cards if tasks are available
                                    filteredTasks.map(task => (
                                        <TaskCard 
                                            key={task._id}                // Unique key for each task
                                            task={task}                   // Pass task data to TaskCard
                                            onClick={() => navigate(`/task/${task._id}`)}  // Navigate to task details page
                                        />
                                    ))
                                ) : (
                                    <p>No tasks found.</p>                 // Display message if no tasks match the filter
                                )}
                            </div>
                        )}
                    </div>
                ) : (

                    /* ✅ Display Events Section */
                    <div className="section">
                        <h2>Events Created</h2>

                        {/* ✅ Event Search Input */}
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={eventFilter}
                            onChange={(e) => setEventFilter(e.target.value)} // Update event filter state
                        />

                        {eventLoading ? (                                   // Show loading indicator if events are loading
                            <p>Loading events...</p>
                        ) : (
                            <div className="event-list">
                                {filteredEvents.length === 0 && (           // Display message if no events match the filter
                                    <p>No events found.</p>
                                )}
                                
                                {/* ✅ Render Event Cards */}
                                {filteredEvents.map(event => (
                                    <div key={event._id} className="event-card">  
                                        <h3>{event.eventName}</h3>
                                        <button 
                                            onClick={() => navigate(`/event/${event._id}/tasks`)}  // Navigate to event tasks
                                        >
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

export default Dashboard;                                               // Export the Dashboard component
