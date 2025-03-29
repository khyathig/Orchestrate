// Dashboard_Assignee.js
import React, { useContext, useEffect, useState } from 'react'; 
import { TaskContext } from './TaskContext_Assignee';
import TaskCard from './TaskCard_Assignee';
import socket from '../../utils/socket';
import '../../styles/Dashboard_Assignee.css'; 

const DashboardAssignee = () => {
  const { tasks, fetchTasks } = useContext(TaskContext);

  // ✅ Add state for search & filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");

  useEffect(() => {
    fetchTasks(); // Fetch tasks on mount

    const handleTaskUpdate = (updatedTask) => {
      console.log('Task updated in real-time:', updatedTask);
      fetchTasks(); // Refresh tasks on updates
    };

    socket.on('taskUpdated', handleTaskUpdate);

    return () => {
      socket.off('taskUpdated', handleTaskUpdate);
    };
  }, [fetchTasks]);

  //  Filtering logic for tasks
  const filteredTasks = tasks.filter((task) => {
    return (
      (!search || task.eventName.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || task.status === statusFilter) &&
      (!eventFilter || task.eventName === eventFilter)
    );
  });


  return (
    <div className="dashboard">
      <h1>Your Assigned Tasks</h1>

      {/* Filters Section */}
      <div className="filters">
        {/* Search Input */}
        <label htmlFor="search">Search by Event Name:</label>
        <input
          id="search"
          type="text"
          placeholder="Search by event name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Status Filter */}
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
          onChange={(e) => setEventFilter(e.target.value)}
        >
          <option value="">All Events</option>
          {[...new Set(tasks.map((task) => task.eventName))].map((event) => (
            <option key={event} value={event}>{event}</option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div className="task-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => <TaskCard key={task._id} task={task} />)
        ) : (
          <p>No tasks available</p>
        )}
      </div>
    </div>
  );
};

export default DashboardAssignee;
