import React from 'react';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ task }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/admin/${task._id}`, { 
      state: { 
        task: { ...task, _id: task._id.toString(), eventID: task.eventID.toString() } // Ensure IDs are strings
      } 
    });
  };

  return (
    <div className="task-card" onClick={handleNavigate}>
      <h3>{task.taskName}</h3>
      <p><strong>Event:</strong> {task.eventName}</p>
      <p><strong>Assignee:</strong> {task.assignee}</p>
      <p><strong>Status:</strong> {task.status}</p>
      <button onClick={handleNavigate}>View Details</button>
    </div>
  );
};

export default TaskCard;
