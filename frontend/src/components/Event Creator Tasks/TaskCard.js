// TaskCard.js
/**
 * TaskCard.js
 *
 * This component displays individual task details in a card format.
 * Clicking on the card or the "View Details" button navigates to the task details page.
 *
 * Dependencies:
 * - React
 * - React Router (useNavigate)
 */

import React from 'react';                               // Import React library
import { useNavigate } from 'react-router-dom';           // Import navigation hook for routing



/**
 * TaskCard Component
 *
 * Displays key details of a task and allows navigation to the task details page.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.task - Task object containing details
 * @param {string} props.task._id - Unique task identifier
 * @param {string} [props.task.taskName] - Name of the task
 * @param {string} [props.task.eventName] - Name of the associated event
 * @param {string} [props.task.assignee] - Name of the assigned person
 * @param {string} [props.task.status] - Current status of the task
 * @param {string} [props.task.eventID] - ID of the associated event
 * @returns {JSX.Element} The TaskCard component
 */
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
