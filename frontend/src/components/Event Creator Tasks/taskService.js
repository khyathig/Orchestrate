// taskService.js
/**
 * @file taskService.js
 * @description Service functions to fetch tasks from the backend API.
 */
import axios from 'axios';
/**
 * Base API URL from environment variables.
 * @constant {string}
 */
// ✅ Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Admin API endpoint.
 * @constant {string}
 */

const API_URL = `${API_BASE_URL}/api/admin`;
/**
 * Logs labeled data for debugging purposes.
 * @param {string} label - Description of the logged data.
 * @param {*} data - Data to log.
 */
// ✅ Enhanced logging function for easier debugging
const logData = (label, data) => {
  console.log(`✅ ${label}:`, data);
};

// ✅ Fetch all tasks
/**
 * Fetches all tasks from the backend API.
 * @async
 * @function
 * @throws {Error} If authentication token or user email is missing.
 * @returns {Promise<Object[]>} A promise that resolves to an array of tasks.
 */
export const fetchTasks = async () => {
  const token = localStorage.getItem('token');              //  Retrieve auth token
  const userEmail = localStorage.getItem('userEmail');      //  Retrieve logged-in user email

  console.log('🟢 Retrieved userEmail:', userEmail);         // Log userEmail
  logData('Token from LocalStorage', token);                 //  Log token
  logData('User Email from LocalStorage', userEmail);        //  Log user email

  // ✅ Check if token and user email exist
  if (!token || !userEmail) {
    console.error("❗ Token or userEmail missing. Please log in.");
    throw new Error("Token or userEmail missing.");
  }

  try {
    const response = await axios.get(API_URL, {              //  Send GET request to fetch all tasks
      headers: {
        Authorization: `Bearer ${token}`,                    //  Include auth token
        "user-email": userEmail                              //  Include user email in header
      }
    });

    logData('Fetched Tasks from API', response.data);         //  Log fetched tasks
    return response.data;                                    // Return fetched tasks
  } catch (error) {
    console.error('❗ Error fetching tasks:', error.response?.data?.message || error.message);
    throw error;                                             //  Throw error if fetching fails
  }
};
/**
 * Fetches a specific task by its ID.
 * @async
 * @function
 * @param {string} id - The ID of the task to fetch.
 * @throws {Error} If authentication token or user email is missing.
 * @returns {Promise<Object>} A promise that resolves to the fetched task object.
 */

export const fetchTaskById = async (id) => {
  const token = localStorage.getItem('token');               // Retrieve auth token
  const userEmail = localStorage.getItem('userEmail');       // Retrieve logged-in user email

  logData('Token for Task Fetch', token);                    //  Log token
  logData('User Email for Task Fetch', userEmail);           //  Log user email
  logData('Task ID Requested', id);                          //  Log task ID being requested

  // ✅ Check if token and user email exist
  if (!token || !userEmail) {
    console.error("❗ Token or userEmail missing. Please log in.");
    throw new Error("Token or userEmail missing.");
  }

  try {
    const response = await axios.get(`${API_URL}/${id}`, {   //  Send GET request for task by ID
      headers: {
        Authorization: `Bearer ${token}`,                    //  Include auth token
        "user-email": userEmail                              //  Include user email in header
      }
    });

    logData(`Fetched Task Data for ID ${id}`, response.data); //  Log fetched task data
    return response.data;                                    //  Return fetched task data
  } catch (error) {
    console.error(`❗ Error fetching task ${id}:`, error.response?.data?.message || error.message);
    throw error;                                             //  Throw error if fetching fails
  }
};
