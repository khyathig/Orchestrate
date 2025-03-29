import axios from 'axios';

// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchTasks = async () => {
  try {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
      console.error("User email not found in localStorage. Please log in.");
      alert("Session expired. Please log in again.");
      return [];
    }

    const response = await axios.get(`${API_BASE_URL}/api/tasks/assigned`, {
      headers: { "user-email": userEmail },
    });

    console.log("Fetched Assigned Tasks:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

export const addCommentToTask = async (taskId, message) => {
  try {
    const userEmail = localStorage.getItem("userEmail");
    const response = await axios.post(`${API_BASE_URL}/api/tasks/assigned/${taskId}/comments`, 
      { message }, 
      { headers: { "user-email": userEmail } }
    );
    console.log("Comment added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    return null;
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    if (!taskId) {
      console.error("Error: Task ID is missing!");
      return null;
    }

    const response = await axios.patch( //  Use PATCH instead of PUT
      `${API_BASE_URL}/api/tasks/${taskId}/status`, 
      { status } // Only send status, taskId is already in the URL
    );

    console.log(`Task status updated to: ${status}`);
    return response.data;
  } catch (error) {
    console.error("Error updating task status:", error);
    return null;
  }
};
