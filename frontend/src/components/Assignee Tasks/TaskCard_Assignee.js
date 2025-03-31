// TaskCard_Assignee.js

import React from 'react';                           // Import React
import { useNavigate } from 'react-router-dom';      // Import navigation hook for routing
import '../../styles/TaskCard_Assignee.css';         // Import CSS for styling

const TaskCard_Assignee = ({ task }) => {            // Component to display individual task details
  const navigate = useNavigate();                    // Hook to navigate between routes

  const handleViewDetails = () => {                  // Function to navigate to task details page
    navigate(`/tasks/${task._id}`, { state: { task } });   // Pass task data as state
  };

  return (
    <div className="task-card">                       {/* Card container */}
      <h3>{task.taskName}</h3>                        {/* Display task name */}
      <p><strong>Event:</strong> {task.eventName}</p>  {/* Display event name */}
      <p><strong>Status:</strong> {task.status}</p>    {/* Display task status */}
      <p><strong>Budget:</strong>                      {/* Display budget or 'N/A' if null */}
        {task.budget !== null ? `₹${task.budget}` : 'N/A'}
      </p>
      <button onClick={handleViewDetails}>            {/* Button to view task details */}
        View Details
      </button>
    </div>
  );
};

export default TaskCard_Assignee;                      // Export component for use in other files
