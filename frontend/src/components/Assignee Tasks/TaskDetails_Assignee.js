import React, { useState, useEffect, useContext } from 'react';// Import hooks for state management and lifecycle
import { useLocation, useNavigate } from 'react-router-dom'; // Import navigation hooks
import { updateTaskStatus } from './api';// Import API function to update task status
import { TaskContext } from './TaskContext_Assignee';// Import TaskContext for global state management
import axios from 'axios';// Import axios for API requests
//import '../../styles/TaskDetails_Assignee.css';

// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
/**
 * Component to display task details and allow updates.
 * Provides task status updates, comments, and assignee details.
 */
const TaskDetails = () => {
  const location = useLocation(); // Get the current location data
  const navigate = useNavigate(); // Hook for programmatic navigation
  const { fetchTasks } = useContext(TaskContext); // Fetch task function from context
  const { task } = location.state || {}; // Ensure task exists

  const [status, setStatus] = useState(task?.status || "Pending");// State for task status
  const [assigneeDetails, setAssigneeDetails] = useState(null);// State to hold assignee details
  const [comments, setComments] = useState(task?.comments || []);// State to hold comments
  const [newComment, setNewComment] = useState(''); // State for new comment input

  useEffect(() => {
    if (!task?.assignee) return; // Exit if no assignee exists
 /**
     * Fetch assignee details from the API.
     */
    const fetchAssigneeDetails = async () => {// Function to fetch assignee details
      try {
        const response = await axios.get(`${API_BASE_URL}/api/employees/${task.assignee}`);
        setAssigneeDetails(response.data);// Set the fetched assignee details
        console.log("Assignee task details", response.data)
      } catch (error) {
        console.error("Error fetching assignee details:", error);
      }
    };

    fetchAssigneeDetails();// Fetch assignee details on component mount
  }, [task?.assignee]);  // Dependency array with task assignee
/**
   * Handle task status change and update UI.
   * @param {string} newStatus - The new status to set.
   */

  //  Fix: Ensure status updates & UI refresh properly
  const handleStatusChange = async (newStatus) => {
    if (!task?._id || newStatus === status) return;  // Exit if no task ID or status unchanged

    try {
      const response = await updateTaskStatus(task._id, newStatus);// Call API to update task status
      if (response) {
        alert("Task status updated successfully!");  // Show success alert
        setStatus(newStatus); // Update status in local state
        await fetchTasks(); //  Ensure the task list updates
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
/**
   * Refresh the task list and navigate back to the dashboard.
   */
  //  Fix: Ensure dashboard reflects updates before navigating
  const handleBackToDashboard = async () => {
    await fetchTasks(); // Fetch latest tasks
    navigate('/pending-tasks'); // Navigate after fetching
  };
/**
   * Handle adding a new comment to the task.
   */
  //  Fix: Handle adding comments properly
  const handleAddComment = async () => {
    if (!newComment.trim()) {// Validate non-empty comment
      console.warn('Comment is empty. Please add a message before submitting.');
      return;
    }

    try {
      const userEmail = localStorage.getItem('userEmail');  // Get user email from localStorage
      if (!userEmail) {
        console.error('User email not found in localStorage');// Validate user email
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
      <h1>{task.taskName}</h1> {/* Display task name */}
      <p><strong>Event:</strong> {task.eventName}</p> {/* Display event name */}
      <p><strong>Description:</strong> {task.description}</p> {/* Display description */}
      <p><strong>Budget:</strong> {task.budget !== null ? `₹${task.budget}` : 'N/A'}</p>  {/* Display budget or N/A */}
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
