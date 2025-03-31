// EventTasksPage.js
/**
 * EventTasksPage.js
 *
 * This component displays all tasks associated with a specific event.
 * Users can filter tasks by status and navigate back to the previous page.
 *
 * Dependencies:
 * - React (useEffect, useState, useContext, useCallback)
 * - React Router (useParams, useNavigate)
 * - EventContext for fetching and displaying tasks
 * - TaskCard component for rendering individual tasks
 */

import React, { useEffect, useState, useContext, useCallback } from "react";  // Import necessary hooks and modules
import { useParams, useNavigate } from "react-router-dom";                    // Import route navigation functions
import { EventContext } from "./EventContext";                                // Import EventContext for event data
import TaskCard from "./TaskCard";  // Import TaskCard component to display individual tasks
/**
 * EventTasksPage Component
 * 
 * Fetches and displays tasks associated with a specific event.
 * Provides filtering functionality and navigation back to the previous page.
 * 
 * @component
 * @returns {JSX.Element} The EventTasksPage component
 */
const EventTasksPage = () => {

    // ✅ Extract event ID from URL params and initialize navigation
    const { eventID } = useParams();                          // Get the event ID from the route
    const navigate = useNavigate();                           // Hook to navigate between pages

    // ✅ Access functions & data from EventContext
    const { fetchEventTasks, selectedEventTasks, loadingTasks } = useContext(EventContext);
    
    const [taskFilter, setTaskFilter] = useState("");         // State for filtering tasks by status

    // ✅ Memoize fetch call to avoid unnecessary re-renders
    const fetchTasks = useCallback(() => {
        if (eventID) fetchEventTasks(eventID);                // Fetch tasks for the specific event
    }, [eventID, fetchEventTasks]);                           // Dependencies: `eventID` & `fetchEventTasks`

    // ✅ Fetch tasks on component mount or when dependencies change
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);                                         // Dependency: `fetchTasks`

    // ✅ Memoized filtering logic to prevent unnecessary re-renders
    const filteredTasks = selectedEventTasks.filter(task => 
        taskFilter ? task.status.toLowerCase().includes(taskFilter.toLowerCase()) : true
    );

    return (
        <div className="event-tasks-container">

            {/* ✅ Button to navigate back */}
            <button onClick={() => navigate(-1)}>⬅ Back</button>

            <h2>Tasks for Event</h2>

            {/* ✅ Input for filtering tasks by status */}
            <input
                type="text"
                placeholder="Filter tasks by status..."
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
            />

            {/* ✅ Display loading message while fetching tasks */}
            {loadingTasks ? (
                <p>Loading tasks...</p>
            ) : (
                <div className="task-list">
                    
                    {/* ✅ Render filtered tasks or display 'No tasks found' */}
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <TaskCard 
                                key={task._id}                           // Unique key for each task
                                task={task}                              // Pass task details to TaskCard component
                                onClick={() => navigate(`/task/${task._id}`)}  // Navigate to task details
                            />
                        ))
                    ) : (
                        <p>No tasks found.</p>                          // Display message when no tasks match the filter
                    )}
                </div>
            )}
        </div>
    );
};

export default EventTasksPage;
