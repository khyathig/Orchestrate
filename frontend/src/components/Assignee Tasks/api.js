import axios from 'axios';                                            // Import Axios for making HTTP requests


// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;              // Base URL for API requests
/**
 * Fetches assigned tasks for the logged-in user.
 * @returns {Promise<Array>} A promise that resolves to an array of assigned tasks.
 */
export const fetchTasks = async () => {                               // Function to fetch assigned tasks
  try {
    const userEmail = localStorage.getItem("userEmail");             // Get user email from localStorage

    if (!userEmail) {      // Check if user email is missing
      console.error("User email not found in localStorage. Please log in.");
      alert("Session expired. Please log in again.");               //Alert user if session expired
      return [];                                                    // Return empty array if no email
    }

    const response = await axios.get(`${API_BASE_URL}/api/tasks/assigned`, {
      headers: { "user-email": userEmail },                          // Send user email in request headers
    });

    console.log("Fetched Assigned Tasks:", response.data);          // Send user email in request headers
    return response.data;                                            // Return the response data
  } catch (error) {
    console.error("Error fetching tasks:", error);                    // Log error if fetching fails
    return [];                                                        // Return empty array on error
  }
};

/**
 * Adds a comment to a specific task.
 * @param {string} taskId - The ID of the task.
 * @param {string} message - The comment message.
 * @returns {Promise<Object|null>} A promise that resolves to the response data or null on error.
 */

export const addCommentToTask = async (taskId, message) => {        // Function to add a comment to a task
  try {
    const userEmail = localStorage.getItem("userEmail");             // Get user email from localStorage
    const response = await axios.post(`${API_BASE_URL}/api/tasks/assigned/${taskId}/comments`, // POST request to add comment
      { message },                                                  // Send message in request body
      { headers: { "user-email": userEmail } }                    // Send user email in request headers
    );
    console.log("Comment added successfully:", response.data);     // Log successful comment addition
    return response.data;                                          // Return the response data
  } catch (error) {
    console.error("Error adding comment:", error);                // Log error if adding fails
    return null;                                                    // Return null on error
  }
};

export const updateTaskStatus = async (taskId, status) => {    // Function to update task status
  try {
    if (!taskId) {                                             // Check if taskId is missing
      console.error("Error: Task ID is missing!");
      return null;                                            // Return null if no ID
    }

    const response = await axios.patch( //  Use PATCH instead of PUT
      `${API_BASE_URL}/api/tasks/${taskId}/status`,   // API endpoint with taskId
      { status } // Only send status, taskId is already in the URL
    );

    console.log(`Task status updated to: ${status}`);// Log successful status update
    return response.data;// Return the response data
  } catch (error) {
    console.error("Error updating task status:", error); // Log error if update fails
    return null;// Return null on error
  }
};
