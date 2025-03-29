import React, { createContext, useState , useCallback} from 'react';
import { fetchTasks } from './api';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  // ✅ Memoized fetch function to prevent infinite re-renders
  const fetchTasksData = useCallback(async () => {
    const data = await fetchTasks();
    setTasks(data);
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, fetchTasks: fetchTasksData }}>
      {children}
    </TaskContext.Provider>
  );
};