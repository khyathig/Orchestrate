/**
 * ReportsPage Component
 * This component is the main container for all reports, including the sidebar and content area.
 * It contains navigation links to different report views such as Home, Comprehensive Reports, and Detailed Event Reports.
 * The sidebar is collapsible based on the screen size, and clicking on a report link collapses the sidebar.
 * 
 * @component
 * 
 * @example
 * // Usage of ReportsPage component
 * <ReportsPage />
 */

import React, { useState, useEffect } from "react";
import { Routes, Route, NavLink, Navigate, useLocation } from "react-router-dom";
import ReportsHome from "./ReportsHome";
import ComprehensiveReport from "./ComprehensiveReport";
import DetailedEventReport from "./DetailedEventReport";
import "../../styles/ReportsPage.css";
/**
 * Manages the layout and navigation for the Reports page, including the sidebar and report views.
 * 
 * - Provides a collapsible sidebar for navigation to different reports.
 * - Displays different reports based on the selected link (Home, Comprehensive, Detailed).
 * - Auto-collapses the sidebar on smaller screens and toggles on larger screens.
 * 
 * @component
 * @returns {JSX.Element} - The rendered ReportsPage component with sidebar and report content.
 */
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

    /**
     * Toggles the sidebar collapse state.
     * 
     * @function
     * @returns {void}
     */
    // Function to handle sidebar toggle
    const toggleSidebar = () => {
        setIsCollapsed((prev) => !prev);
    };

    /**
     * Handles navigation link clicks to collapse the sidebar after a report is selected.
     * 
     * @function
     * @returns {void}
     */
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
