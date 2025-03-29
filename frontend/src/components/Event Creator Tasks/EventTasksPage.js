import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EventContext } from "./EventContext";
import TaskCard from "./TaskCard";

const EventTasksPage = () => {
    const { eventID } = useParams();
    const navigate = useNavigate();
    const { fetchEventTasks, selectedEventTasks, loadingTasks } = useContext(EventContext);
    
    const [taskFilter, setTaskFilter] = useState("");

    // Memoize fetch call to avoid unnecessary re-renders
    const fetchTasks = useCallback(() => {
        if (eventID) fetchEventTasks(eventID);
    }, [eventID, fetchEventTasks]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Memoized filtering to prevent excessive computations on render
    const filteredTasks = selectedEventTasks.filter(task => 
        taskFilter ? task.status.toLowerCase().includes(taskFilter.toLowerCase()) : true
    );

    return (
        <div className="event-tasks-container">
            <button onClick={() => navigate(-1)}>⬅ Back</button>
            <h2>Tasks for Event</h2>
            <input
                type="text"
                placeholder="Filter tasks by status..."
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
            />
            {loadingTasks ? (
                <p>Loading tasks...</p>
            ) : (
                <div className="task-list">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <TaskCard 
                                key={task._id} 
                                task={task} 
                                onClick={() => navigate(`/task/${task._id}`)} 
                            />
                        ))
                    ) : (
                        <p>No tasks found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventTasksPage;
