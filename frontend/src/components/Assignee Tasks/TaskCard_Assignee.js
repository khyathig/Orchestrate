import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/TaskCard_Assignee.css';

const TaskCard_Assignee = ({ task }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/tasks/${task._id}`, { state: { task } });
  };

  return (
    <div className="task-card">
      <h3>{task.taskName}</h3>
      <p><strong>Event:</strong> {task.eventName}</p>
      <p><strong>Status:</strong> {task.status}</p>
      <p><strong>Budget:</strong> {task.budget !== null ? `₹${task.budget}` : 'N/A'}</p>
      <button onClick={handleViewDetails}>View Details</button>
    </div>
  );
};

export default TaskCard_Assignee;
