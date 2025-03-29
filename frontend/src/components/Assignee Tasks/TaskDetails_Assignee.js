import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateTaskStatus } from './api';
import { TaskContext } from './TaskContext_Assignee';
import axios from 'axios';
//import '../../styles/TaskDetails_Assignee.css';

// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TaskDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchTasks } = useContext(TaskContext);
  const { task } = location.state || {}; // Ensure task exists

  const [status, setStatus] = useState(task?.status || "Pending");
  const [assigneeDetails, setAssigneeDetails] = useState(null);
  const [comments, setComments] = useState(task?.comments || []);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!task?.assignee) return;

    const fetchAssigneeDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/employees/${task.assignee}`);
        setAssigneeDetails(response.data);
        console.log("Assignee task details", response.data)
      } catch (error) {
        console.error("Error fetching assignee details:", error);
      }
    };

    fetchAssigneeDetails();
  }, [task?.assignee]);

  //  Fix: Ensure status updates & UI refresh properly
  const handleStatusChange = async (newStatus) => {
    if (!task?._id || newStatus === status) return;

    try {
      const response = await updateTaskStatus(task._id, newStatus);
      if (response) {
        alert("Task status updated successfully!");
        setStatus(newStatus);
        await fetchTasks(); //  Ensure the task list updates
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  //  Fix: Ensure dashboard reflects updates before navigating
  const handleBackToDashboard = async () => {
    await fetchTasks(); // Fetch latest tasks
    navigate('/pending-tasks'); // Navigate after fetching
  };

  //  Fix: Handle adding comments properly
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      console.warn('Comment is empty. Please add a message before submitting.');
      return;
    }

    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.error('User email not found in localStorage');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/tasks/assigned/${task?._id}/comments`, // Fix: Ensure correct URL
        { message: newComment },
        { headers: { "user-email": userEmail } }
      );

      if (response.data.task?.comments?.length) {
        setComments(response.data.task.comments); //  Set all comments instead of appending manually
        setNewComment('');
      } else {
        console.warn('No comments found in response.');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  //  Fix: Ensure task is always defined before rendering
  if (!task?._id) {
    return <div className="task-details"><h2>Task not found.</h2></div>;
  }

  return (
    <div className="task-details">
      <h1>{task.taskName}</h1>
      <p><strong>Event:</strong> {task.eventName}</p>
      <p><strong>Description:</strong> {task.description}</p>
      <p><strong>Budget:</strong> {task.budget !== null ? `₹${task.budget}` : 'N/A'}</p>
      <p>
        <strong>Assigned To:</strong> {assigneeDetails ? `${assigneeDetails.name} (${assigneeDetails.email})` : task.assignee}
      </p>
      <p><strong>Assigned By:</strong> {task.creator}</p>

      {/*  Fixed Status Update Dropdown */}
      <div className="status-update">
        <label><strong>Status:</strong></label>
        <select value={status} onChange={(e) => handleStatusChange(e.target.value)}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/*  Fix: Handle undefined comment timestamps */}
      <div className="comments-section">
        <h3>Comments</h3>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="comment">
              <p>{comment.message}</p>
              <small>
                By {comment.author} at {comment.timestamp ? new Date(comment.timestamp).toLocaleString() : "Unknown Time"}
              </small>
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}

        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button onClick={handleAddComment}>Add Comment</button>
      </div>

      {/*  Fix: Ensure dashboard updates before navigating */}
      <button onClick={handleBackToDashboard}>Refresh & Back to Dashboard</button>
    </div>
  );
};

export default TaskDetails;
