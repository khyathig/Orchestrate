// TaskContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';  
import { fetchTasks, fetchTaskById } from './taskService';      // Import task fetching functions

// ✅ Create a Context for task management
export const TaskContext = createContext();

export const TaskContextProvider = ({ children }) => {          // Provider component for managing task state
  const [tasks, setTasks] = useState([]);                       // State to hold the list of tasks
  const [loading, setLoading] = useState(false);                 // Loading state indicator
  const [error, setError] = useState(null);                      // Error state for handling errors

  // ✅ Memoized function to load all tasks
  const loadTasks = useCallback(async () => {
    console.log(" loadTasks() called");                         // Debug log: function execution
    setLoading(true);                                           // Set loading state to true
    try {
      const data = await fetchTasks();                          // Fetch all tasks from the server
      console.log(" Tasks fetched successfully:", data);        // Debug log: fetched data
      setTasks(data);                                           // Update state with fetched tasks
    } catch (error) {
      console.error(" Error loading tasks:", error);            // Handle and log any errors
      setError(error.message);                                  // Store the error message
    } finally {
      setLoading(false);                                        // Set loading state to false
    }
  }, []);                                                       // Dependency array to avoid infinite re-renders

  // ✅ Effect hook to log updated tasks whenever the task state changes
  useEffect(() => {
    console.log(" Tasks updated:", tasks);                      // Log task updates
  }, [tasks]);                                                  // Runs whenever `tasks` state changes

  // ✅ Fetch a specific task by ID
  const getTaskById = async (id) => {
    try {
      console.log(` Fetching task with ID: ${id}`);             // Debug log: ID being fetched
      const task = await fetchTaskById(id);                     // Fetch task details by ID
      return task;                                              // Return the fetched task
    } catch (error) {
      console.error(" Error fetching task:", error);            // Handle and log any errors
      throw error;                                              // Rethrow error for handling in components
    }
  };

  // ✅ Initial load effect to fetch all tasks when the provider mounts
  useEffect(() => {
    console.log(" Initializing TaskContext, calling loadTasks()");
    loadTasks();                                                // Fetch tasks on component mount
  }, [loadTasks]);                                              // Dependency: `loadTasks`

  return (
    <TaskContext.Provider value={{                            // Provide task data and functions
      tasks,                                                  // List of tasks
      loading,                                                // Loading state
      error,                                                  // Error message
      loadTasks,                                              // Function to reload tasks
      getTaskById                                             // Function to fetch task by ID
    }}>
      {children}                                              {/* Render children inside the provider */}
    </TaskContext.Provider>
  );
};
