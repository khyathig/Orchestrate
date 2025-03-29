import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import EventFeed from "./components/Feed/EventFeed";
import EventForm from "./components/Feed/EventForm";
import Navbar from "./components/Feed/Navbar";
import RazorpayButton from "./components/Feed/RazorpayButton";
import ReportsPage from "./components/Reports/ReportsPage";
import Dashboard from "./components/Event Creator Tasks/Dashboard";
import TaskDetails from "./components/Event Creator Tasks/TaskDetails";
import EventTasksPage from "./components/Event Creator Tasks/EventTasksPage";
import DashboardAssignee from "./components/Assignee Tasks/Dashboard_Assignee";
import TaskDetailsAssignee from "./components/Assignee Tasks/TaskDetails_Assignee";
import { TaskProvider } from "./components/Assignee Tasks/TaskContext_Assignee";
import { TaskContextProvider } from "./components/Event Creator Tasks/TaskContext";
import { EventProvider } from "./components/Event Creator Tasks/EventContext";
import "./styles/App.css";

function App() {
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setLoggedInUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setLoggedInUser(null);
    };

    return (
        <EventProvider>
            <TaskContextProvider>
                <TaskProvider>
                    <Router>
                        {loggedInUser && <Navbar handleLogout={handleLogout} userRole={loggedInUser?.role} />}
                        <Routes>
                            {/* Authentication */}
                            <Route 
                                path="/" 
                                element={loggedInUser ? <Navigate to="/feed" replace /> : <Login setLoggedInUser={setLoggedInUser} />}
                            />

                            {/* Event Feed */}
                            <Route 
                                path="/feed" 
                                element={loggedInUser ? (
                                    <>
                                        <EventFeed loggedInUser={loggedInUser} />
                                        <RazorpayButton amount={100} />
                                    </>
                                ) : <Navigate to="/" replace />}
                            />

                            {/* Create Event */}
                            <Route 
                                path="/create-event" 
                                element={loggedInUser ? <EventForm /> : <Navigate to="/" replace />}
                            />

                            {/* Reports Section */}
                            <Route 
                                path="/reports/*" 
                                element={loggedInUser ? <ReportsPage /> : <Navigate to="/" replace />}
                            />

                           {/* Event Creator's Dashboard */}
                           <Route 
                                path="/manage-events" 
                                element={loggedInUser ? <Dashboard /> : <Navigate to="/" replace />}
                            />
                            <Route 
                                path="/admin/:id" 
                                element={loggedInUser ? <TaskDetails /> : <Navigate to="/" replace />}
                            />
                            {/* ✅ New Route for Viewing Event-Specific Tasks */}
                            <Route 
                                path="/event/:eventID/tasks" 
                                element={loggedInUser ? <EventTasksPage /> : <Navigate to="/" replace />}
                            />


                            {/* Task Assignee Dashboard */}
                            <Route 
                                path="/pending-tasks" 
                                element={loggedInUser ? <DashboardAssignee /> : <Navigate to="/" replace />}
                            />
                            <Route 
                                path="/tasks/:id" 
                                element={loggedInUser ? <TaskDetailsAssignee /> : <Navigate to="/" replace />}
                            />

                            {/* Catch-All Redirect */}
                            <Route 
                                path="*" 
                                element={<Navigate to={loggedInUser ? "/feed" : "/"} replace />}
                            />
                        </Routes>
                    </Router>
                </TaskProvider>
            </TaskContextProvider>
        </EventProvider>
    );
}

export default App;
