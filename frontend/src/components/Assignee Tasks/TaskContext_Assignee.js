// TaskContext_Assignee.js

import React, { createContext, useState, useCallback } from 'react';  // Import React hooks
import { fetchTasks } from './api';                                  // Import API function to fetch tasks

export const TaskContext = createContext();                          // Create a new context for tasks

export const TaskProvider = ({ children }) => {                      // TaskProvider component to wrap child components
  const [tasks, setTasks] = useState([]);                            // State to hold the list of tasks

  // ✅ Memoized fetch function to prevent infinite re-renders
  const fetchTasksData = useCallback(async () => {                    // useCallback to memoize the function
    const data = await fetchTasks();                                  // Fetch tasks from API
    setTasks(data);                                                   // Update the tasks state with fetched data
  }, []);                                                             // Empty dependency array to memoize the function

  return (
    <TaskContext.Provider value={{ tasks, fetchTasks: fetchTasksData }}>  {/* Provide tasks and fetchTasks function */}
      {children}                                                       {/* Render child components */}
    </TaskContext.Provider>
  );
};
