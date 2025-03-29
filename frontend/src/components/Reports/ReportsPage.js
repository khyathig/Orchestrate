import React, { useState, useEffect } from "react";
import { Routes, Route, NavLink, Navigate, useLocation } from "react-router-dom";
import ReportsHome from "./ReportsHome";
import ComprehensiveReport from "./ComprehensiveReport";
import DetailedEventReport from "./DetailedEventReport";
import "../../styles/ReportsPage.css";

const ReportsPage = () => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);

    // Handle window resize to auto-collapse sidebar on smaller screens
    useEffect(() => {
        const handleResize = () => {
            setIsCollapsed(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Function to handle sidebar toggle
    const toggleSidebar = () => {
        setIsCollapsed((prev) => !prev);
    };

    // Function to collapse sidebar after selecting a report
    const handleNavClick = () => {
        setIsCollapsed(true);
    };

    return (
        <div className="reports-container">
            {/* Sidebar */}
            <nav className={`reports-sidebar ${isCollapsed ? "collapsed" : ""}`}>
                <button 
                    className="toggle-btn" 
                    onClick={toggleSidebar} 
                    aria-label="Toggle sidebar"
                >
                    {isCollapsed ? "☰" : "✖"}
                </button>
                {!isCollapsed && <h2>Reports</h2>}
                <ul>
                    <li>
                        <NavLink 
                            to="/reports/home" 
                            className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                            onClick={handleNavClick}
                        >
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/reports/comprehensive" 
                            className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                            onClick={handleNavClick}
                        >
                            Comprehensive Reports
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/reports/detailed" 
                            className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                            onClick={handleNavClick}
                        >
                            Detailed Reports
                        </NavLink>
                    </li>
                </ul>
            </nav>

            {/* Reports Content */}
            <div className={`reports-content ${isCollapsed ? "expanded" : ""}`}>
                <div className="reports-header">Reports</div>
                <div className="reports-scrollable">
                    <Routes key={location.pathname}>
                        <Route path="home" element={<ReportsHome />} />
                        <Route path="comprehensive" element={<ComprehensiveReport />} />
                        <Route path="detailed" element={<DetailedEventReport />} />
                        <Route path="*" element={<Navigate to="/reports/home" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
