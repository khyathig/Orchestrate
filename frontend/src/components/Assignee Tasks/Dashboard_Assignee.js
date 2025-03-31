// Dashboard_Assignee.js

import React, { useContext, useEffect, useState } from 'react';  // Import hooks from React
import { TaskContext } from './TaskContext_Assignee';            // Import TaskContext for global state management
import TaskCard from './TaskCard_Assignee';                      // Import TaskCard component to display individual tasks
import socket from '../../utils/socket';                         // Import socket for real-time updates
import '../../styles/Dashboard_Assignee.css';                     // Import CSS for styling


/**
 * Dashboard component for assignees to view and manage assigned tasks.
 * Allows searching, filtering, and real-time task updates.
 * @returns {JSX.Element} The rendered dashboard component.
 */

const DashboardAssignee = () => {
  const { tasks, fetchTasks } = useContext(TaskContext);         // Use TaskContext to access tasks and fetchTasks function

  // ✅ Add state for search & filters
  const [search, setSearch] = useState("");                      // State for search input
  const [statusFilter, setStatusFilter] = useState("");          // State for status filter
  const [eventFilter, setEventFilter] = useState("");            // State for event filter

  useEffect(() => {
    fetchTasks();                                                // Fetch tasks when the component mounts

    const handleTaskUpdate = (updatedTask) => {                  // Handle real-time task updates
      console.log('Task updated in real-time:', updatedTask);    // Log the updated task
      fetchTasks();                                              // Refresh task list after update
    };

    socket.on('taskUpdated', handleTaskUpdate);                   // Listen for 'taskUpdated' events

    return () => {
      socket.off('taskUpdated', handleTaskUpdate);                // Clean up event listener on unmount
    };
  }, [fetchTasks]);                                              // Dependency array includes fetchTasks to avoid unnecessary re-renders

  // ✅ Filtering logic for tasks
  const filteredTasks = tasks.filter((task) => {                 
    return (
      (!search || task.eventName.toLowerCase().includes(search.toLowerCase())) &&  // Filter by event name (case-insensitive)
      (!statusFilter || task.status === statusFilter) &&                           // Filter by status
      (!eventFilter || task.eventName === eventFilter)                             // Filter by event name
    );
  });

  return (
    <div className="dashboard">
      <h1>YOUR ASSIGNED TASK</h1>

      {/* ✅ Filters Section */}
      <div className="filters">

        {/* Search Input */}
        <label htmlFor="search">Search by Event Name:</label>      
        <input
          id="search"
          type="text"
          placeholder="Search by event name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}             // Update search state on input change
        />

        {/* Status Filter */}
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}       // Update status filter state on selection
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Event Filter */}
        <label htmlFor="eventFilter">Filter by Event:</label>
        <select
          id="eventFilter"
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}        // Update event filter state on selection
        >
          <option value="">All Events</option>
          {[...new Set(tasks.map((task) => task.eventName))].map((event) => (   // Dynamically generate event filter options
            <option key={event} value={event}>{event}</option>                  // Display unique event names as filter options
          ))}
        </select>
      </div>

      {/* ✅ Task List */}
      <div className="task-list">
        {filteredTasks.length > 0 ? (                           // Check if filtered tasks exist
          filteredTasks.map(task => <TaskCard key={task._id} task={task} />)   // Render TaskCard for each task
        ) : (
          <p>No tasks available</p>                              // Display message if no tasks match the filters
        )}
      </div>
    </div>
  );
};

export default DashboardAssignee;   // Export the component for use in other files
