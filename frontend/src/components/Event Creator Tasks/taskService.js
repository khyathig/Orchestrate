import axios from 'axios';

// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const API_URL = `${API_BASE_URL}/api/admin`;

// Enhanced logging function
const logData = (label, data) => {
  console.log(`✅ ${label}:`, data);
};

// Fetch all tasks
export const fetchTasks = async () => {
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');
  console.log('🟢 Retrieved userEmail:', userEmail);
  logData('Token from LocalStorage', token);
  logData('User Email from LocalStorage', userEmail);

  if (!token || !userEmail) {
    console.error("❗ Token or userEmail missing. Please log in.");
    throw new Error("Token or userEmail missing.");
  }

  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "user-email": userEmail,
      }
    });

    logData('Fetched Tasks from API', response.data);
    return response.data;
  } catch (error) {
    console.error('❗ Error fetching tasks:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Fetch a task by ID
export const fetchTaskById = async (id) => {
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');

  logData('Token for Task Fetch', token);
  logData('User Email for Task Fetch', userEmail);
  logData('Task ID Requested', id);

  if (!token || !userEmail) {
    console.error("❗ Token or userEmail missing. Please log in.");
    throw new Error("Token or userEmail missing.");
  }

  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "user-email": userEmail,
      }
    });

    logData(`Fetched Task Data for ID ${id}`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❗ Error fetching task ${id}:`, error.response?.data?.message || error.message);
    throw error;
  }
};