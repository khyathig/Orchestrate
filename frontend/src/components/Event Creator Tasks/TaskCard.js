// components/TaskCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({  task, onViewDetails }) => {
  const navigate= useNavigate();
  const handleNavigate = () => {
    navigate(`/admin/${task._id}`); // Correct route for event creators
  };
  
  return (
    <div className="task-card" onClick={handleNavigate}>
      <h3>{task.taskName}</h3>
      <p><strong>Event:</strong> {task.eventName}</p>
      <p><strong>Assignee:</strong> {task.assignee}</p>
      <p><strong>Status:</strong> {task.status}</p>
      <button onClick={onViewDetails}>View Details</button>
    </div>
  );
};

export default TaskCard;
