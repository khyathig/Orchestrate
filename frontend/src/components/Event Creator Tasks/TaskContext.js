import React, { createContext, useState, useEffect, useCallback } from 'react';
import { fetchTasks, fetchTaskById } from './taskService';

export const TaskContext = createContext();

export const TaskContextProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    console.log(" loadTasks() called"); 
    setLoading(true);
    try {
      const data = await fetchTasks();
      console.log(" Tasks fetched successfully:", data);
      setTasks(data);
    } catch (error) {
      console.error(" Error loading tasks:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []); // Removed 'loading' from dependency array

  useEffect(() => {
    console.log(" Tasks updated:", tasks);
  }, [tasks]);

  const getTaskById = async (id) => {
    try {
      console.log(` Fetching task with ID: ${id}`);
      const task = await fetchTaskById(id);
      return task;
    } catch (error) {
      console.error(" Error fetching task:", error);
      throw error;
    }
  };

  useEffect(() => {
    console.log(" Initializing TaskContext, calling loadTasks()");
    loadTasks();
  }, [loadTasks]);

  return (
    <TaskContext.Provider value={{ tasks, loading, error, loadTasks, getTaskById }}>
      {children}
    </TaskContext.Provider>
  );
};
