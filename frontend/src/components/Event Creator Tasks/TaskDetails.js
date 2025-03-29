import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TaskContext } from "./TaskContext";
import axios from "axios";
import "../../styles/TaskDetails.css";

// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TaskDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchTasks } = useContext(TaskContext);
  const { task } = location.state || {};

  const [assigneeDetails, setAssigneeDetails] = useState(null);
  const [comments, setComments] = useState(task?.comments || []);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!task?._id) {
      console.error("⚠ Task data not received correctly.");
    } else {
      console.log("✅ Task Details:", task);
    }
  }, [task]);

  // Fetch assignee details
  useEffect(() => {
    if (!task?.assignee) return;

    const fetchAssigneeDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/employees/${task.assignee}`);
        setAssigneeDetails(response.data);
      } catch (error) {
        console.error("❌ Error fetching assignee details:", error);
      }
    };

    fetchAssigneeDetails();
  }, [task?.assignee]);

  // Fetch latest comments every 5 seconds (Polling)
  useEffect(() => {
    if (!task?._id) return;

    const fetchComments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/${task._id}/comments`);
        setComments(response.data.comments || []);
      } catch (error) {
        console.error("❌ Error fetching comments:", error);
      }
    };

    fetchComments();
    const interval = setInterval(fetchComments, 5000); // Fetch comments every 5s

    return () => clearInterval(interval); // Cleanup on unmount
  }, [task?._id]);

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      console.warn("⚠ Comment is empty. Please add a message before submitting.");
      return;
    }
  
    try {
      const userEmail = localStorage.getItem("userEmail"); // Get logged-in user email
      if (!userEmail) {
        console.error("❌ User email not found in localStorage");
        return;
      }
  
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/${task._id}/comments`, // Corrected endpoint
        { 
          email: userEmail,  // Logged-in user's email
          author: task.creator, // Task creator as the author
          message: newComment 
        }
      );
  
      if (response.data.task?.comments?.length) {
        setComments(response.data.task.comments); // Set all comments instead of appending manually
        setNewComment("");
      } else {
        console.warn("⚠ No comments found in response.");
      }
    } catch (error) {
      console.error("❌ Error adding comment:", error);
    }
  };
  

  // Navigate back and refresh tasks
  const handleBackToDashboard = async () => {
    if (fetchTasks) await fetchTasks();
    if (task?.eventID) {
      navigate(`/manage-events`);
    } else {
      navigate(-1);
    }
  };

  if (!task || !task._id) {
    return (
      <div className="task-details">
        <h2>⚠ Task not found.</h2>
      </div>
    );
  }

  return (
    <div className="task-details">
      <h1>{task.taskName}</h1>
      <p><strong>Event:</strong> {task.eventName}</p>
      <p><strong>Description:</strong> {task.description}</p>
      <p><strong>Budget:</strong> {task.budget !== null ? `₹${task.budget}` : "N/A"}</p>
      <p><strong>Event ID:</strong> {task.eventID}</p>
      <p><strong>Assigned To:</strong> {assigneeDetails ? `${assigneeDetails.name} (${assigneeDetails.email})` : task.assignee}</p>
      <p><strong>Assigned By:</strong> {task.creator}</p>

      <div className="comments-section">
        <h3>Comments</h3>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="comment">
              <p>{comment.message}</p>
              <small>By {comment.author} at {comment.timestamp ? new Date(comment.timestamp).toLocaleString() : "Unknown Time"}</small>
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

      <button onClick={handleBackToDashboard}>Refresh & Back to Dashboard</button>
    </div>
  );
};

export default TaskDetails;
