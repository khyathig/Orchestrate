// TaskDetails.js
/**
 * TaskDetails.js
 *
 * Displays detailed information about a specific task, including its event details,
 * assigned personnel, and comments. Users can add comments and navigate back to the
 * dashboard.
 *
 * Dependencies:
 * - React (useState, useEffect, useContext)
 * - react-router-dom (useLocation, useNavigate)
 * - TaskContext (fetchTasks)
 * - axios (HTTP requests)
 * - TaskDetails.css (Styling)
 */
import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TaskContext } from "./TaskContext";                  // ✅ Import TaskContext
import axios from "axios";                                    // ✅ Axios for HTTP requests
import "../../styles/TaskDetails.css";                        // ✅ Import CSS styles

// ✅ Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
/**
 * TaskDetails Component
 *
 * Fetches and displays details about a specific task.
 * Allows users to view and add comments.
 *
 * @component
 * @returns {JSX.Element} Task details UI
 */
const TaskDetails = () => {
  const location = useLocation();                            // ✅ Get current route location
  const navigate = useNavigate();                            // ✅ Navigate between pages
  const { fetchTasks } = useContext(TaskContext);            // ✅ Fetch tasks from context
  const { task } = location.state || {};                     // ✅ Get task data from route state

  const [assigneeDetails, setAssigneeDetails] = useState(null); // ✅ Store assignee info
  const [comments, setComments] = useState(task?.comments || []); // ✅ Store task comments
  const [newComment, setNewComment] = useState("");          // ✅ New comment input state

  // ✅ Initial task validation on mount
  
  useEffect(() => {
    if (!task?._id) {
      console.error("⚠ Task data not received correctly.");
    } else {
      console.log("✅ Task Details:", task);
    }
  }, [task]);

  // ✅ Fetch assignee details
  /**
   * Fetches assignee details from the API.
   */
  useEffect(() => {
    if (!task?.assignee) return;                            // ✅ Skip if no assignee ID

    const fetchAssigneeDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/employees/${task.assignee}`);
        setAssigneeDetails(response.data);                   // ✅ Set fetched assignee details
      } catch (error) {
        console.error("❌ Error fetching assignee details:", error);
      }
    };

    fetchAssigneeDetails();
  }, [task?.assignee]);                                      // ✅ Re-fetch on assignee ID change

  // ✅ Polling: Fetch latest comments every 5 seconds
  useEffect(() => {
    if (!task?._id) return;

    const fetchComments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/${task._id}/comments`);
        setComments(response.data.comments || []);            // Update comments
      } catch (error) {
        console.error("❌ Error fetching comments:", error);
      }
    };

    fetchComments();
    const interval = setInterval(fetchComments, 5000);        //  Poll every 5 seconds

    return () => clearInterval(interval);                     //  Cleanup interval on unmount
  }, [task?._id]);

  // ✅ Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {                                //  Ensure comment isn't empty
      console.warn("⚠ Comment is empty. Please add a message before submitting.");
      return;
    }
  
    try {
      const userEmail = localStorage.getItem("userEmail");    //  Get user email from localStorage
      if (!userEmail) {
        console.error("❌ User email not found in localStorage");
        return;
      }
  
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/${task._id}/comments`,     //  API endpoint to add comments
        { 
          email: userEmail,                                   //  Include user email
          author: task.creator,                               //  Set task creator as author
          message: newComment                                 //  New comment content
        }
      );
  
      if (response.data.task?.comments?.length) {             //  Update comments with response
        setComments(response.data.task.comments);             
        setNewComment("");                                    //  Clear input field
      } else {
        console.warn("⚠ No comments found in response.");
      }
    } catch (error) {
      console.error("❌ Error adding comment:", error);
    }
  };

  // ✅ Navigate back and refresh tasks
  const handleBackToDashboard = async () => {
    if (fetchTasks) await fetchTasks();                      // Refresh task list
    if (task?.eventID) {                                     
      navigate(`/manage-events`);                            //  Navigate to event management
    } else {
      navigate(-1);                                          //  Go back one page
    }
  };

  // ✅ Handle missing task
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
      <p>
        <strong>Assigned To:</strong> 
        {assigneeDetails ? `${assigneeDetails.name} (${assigneeDetails.email})` : task.assignee}
      </p>
      <p><strong>Assigned By:</strong> {task.creator}</p>

      {/* ✅ Comments section */}
      <div className="comments-section">
        <h3>Comments</h3>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="comment">
              <p>{comment.message}</p>
              <small>
                By {comment.author} at {comment.timestamp 
                  ? new Date(comment.timestamp).toLocaleString() 
                  : "Unknown Time"}
              </small>
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}

        {/* ✅ Add new comment */}
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
