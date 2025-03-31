// TaskCard.js

import React from 'react';                               // Import React library
import { useNavigate } from 'react-router-dom';           // Import navigation hook for routing

const TaskCard = ({ task }) => {                          // Component to display individual task details
  const navigate = useNavigate();                         // Hook for programmatic navigation

  // ✅ Navigation handler to go to task details page
  const handleNavigate = () => {
    navigate(`/admin/${task._id}`, {                      // Navigate to task details page
      state: { 
        task: { 
          ...task,                                        // Spread task properties
          _id: task._id?.toString(),                      // Convert `_id` to string for consistency
          eventID: task.eventID?.toString()               // Convert `eventID` to string
        } 
      } 
    });
  };

  return (
    <div className="task-card" onClick={handleNavigate}>   {/* ✅ Clickable card to navigate to details */}
      
      {/* ✅ Display task name only if it exists */}
      {task.taskName && <h3>{task.taskName}</h3>}          

      {/* ✅ Display event name if it exists */}
      {task.eventName && <p><strong>Event:</strong> {task.eventName}</p>} 

      {/* ✅ Display assignee if it exists */}
      {task.assignee && <p><strong>Assignee:</strong> {task.assignee}</p>} 

      {/* ✅ Display status if it exists */}
      {task.status && <p><strong>Status:</strong> {task.status}</p>}   

      {/* ✅ Button to view task details */}
      <button onClick={handleNavigate}>View Details</button> 

    </div>
  );
};

export default TaskCard;                                   // Export the TaskCard component
