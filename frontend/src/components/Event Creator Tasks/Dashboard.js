/*import React, { useContext, useState, useEffect, useCallback } from 'react';
import { TaskContext } from './TaskContext';
import TaskCard from './TaskCard';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  const { tasks, loadTasks } = useContext(TaskContext);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');

  
  const stableLoadTasks = useCallback(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    console.log('Loading tasks...');
    stableLoadTasks();
  }, [stableLoadTasks]);

  const filteredTasks = tasks.filter((task) => {
    const isCreatorMatch = task.creator === localStorage.getItem('userEmail');
    const statusMatch = statusFilter ? task.status === statusFilter : true;
    const eventMatch = eventFilter ? task.eventName === eventFilter : true;
    const searchMatch = search
      ? task.eventName.toLowerCase().includes(search.toLowerCase()) // Case-insensitive substring match
      : true;
  
    return isCreatorMatch && statusMatch && eventMatch && searchMatch;
  });
  

  return (
    <div className="dashboard">
      <h1>Manage Your Events</h1>

      <div className="filters">
        {/* Search Input }
        <label htmlFor="search">Search by Event Name:</label>
        <input
          id="search"
          name="search"
          type="text"
          placeholder="Search by event name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Status Filter }
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select
          id="statusFilter"
          name="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        {/* Event Filter }
        <label htmlFor="eventFilter">Filter by Event:</label>
        <select
          id="eventFilter"
          name="eventFilter"
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
        >
          <option value="">All Events</option>
          {[...new Set(tasks.map((task) => task.eventName))].map((event) => (
            <option key={event} value={event}>{event}</option>
          ))}
        </select>
      </div>

      <div className="task-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => <TaskCard key={task._id} task={task} />)
        ) : (
          <p>No tasks available</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;*/

import React, { useState, useEffect, useContext } from "react";
import { TaskContext } from "./TaskContext";
import { EventContext } from "./EventContext";
import { useNavigate } from "react-router-dom"; // Import for navigation
import TaskCard from "./TaskCard";
import "../../styles/Dashboard.css";

const Dashboard = () => {
    const { tasks, loadTasks, loading: taskLoading } = useContext(TaskContext);
    const { events, loadEvents, loading: eventLoading } = useContext(EventContext);
    const navigate = useNavigate(); // Hook for navigation

    const [activeSection, setActiveSection] = useState("tasks"); // Default open section

    useEffect(() => {
        loadTasks();
        loadEvents();
    }, [loadTasks, loadEvents]);

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <button 
                    className={activeSection === "tasks" ? "active" : ""}
                    onClick={() => setActiveSection("tasks")}
                >
                    Tasks Assigned
                </button>
                <button 
                    className={activeSection === "events" ? "active" : ""}
                    onClick={() => setActiveSection("events")}
                >
                    Events Created
                </button>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {activeSection === "tasks" ? (
                    <div className="section">
                        <h2>Tasks Assigned</h2>
                        {taskLoading ? <p>Loading tasks...</p> : (
                            <div className="task-list">
                                {tasks.map(task => (
                                    <TaskCard 
                                        key={task._id} 
                                        task={task} 
                                        onClick={() => navigate(`/task/${task._id}`)} // Navigate to task details
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="section">
                        <h2>Events Created</h2>
                        {eventLoading ? <p>Loading events...</p> : (
                            <div className="event-list">
                                {events.map(event => (
                                    <div key={event._id} className="event-card">
                                        <h3>{event.eventName}</h3>
                                        <button onClick={() => navigate(`/event/${event._id}`)}>View Tasks</button>
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