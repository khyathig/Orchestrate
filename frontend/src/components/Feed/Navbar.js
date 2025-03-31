import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; 
import "../../styles/Navbar.css";
/**
 * Navbar Component for managing navigation and displaying menu options.
 * 
 * This component renders a responsive navigation bar that displays different menu options based on the user's role.
 * It provides functionality to toggle the mobile menu, navigate to different routes, and log the user out.
 * 
 * @component
 * @example
 * return <Navbar handleLogout={logoutFunction} userRole="manager" />;
 * 
 * @param {Object} props - The component props.
 * @param {Function} props.handleLogout - Function to handle the user logout process.
 * @param {string} props.userRole - The role of the user (e.g., 'admin', 'manager', 'employee').
 */
function Navbar({ handleLogout, userRole }) {
     /**
     * useNavigate hook to navigate programmatically
     */
    const navigate = useNavigate();
    /**
     * State hook for managing the state of the mobile menu (open or closed).
     */
    const [menuOpen, setMenuOpen] = useState(false);
    /**
     * Toggles the menu open/closed when the hamburger icon is clicked.
     */
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };
/**
     * Handles navigation to the given path and ensures the menu is closed after selection.
     * If navigating to the "/feed" route, it clears the navigation history to avoid going back.
     * 
     * @param {string} path - The path to navigate to.
     */
    const handleNavigation = (path) => {
        navigate(path);// Navigate to the desired path
        
        // Close the menu immediately after selection
        setMenuOpen(false);
    
        // If navigating to "/feed", clear history
        if (path === "/feed") {
            navigate(path, { replace: true });
        } else {
            setTimeout(() => {
                window.history.replaceState(null, "", "/feed"); // Ensure history resets to feed
            }, 50);
        }
    };

    return (
        <div className={`navbar ${menuOpen ? "expanded" : ""}`}>
            <h2 className="logo">Orchestrate</h2>

            {/* Hamburger Icon */}
            <div className="hamburger-menu" onClick={toggleMenu}>
                {menuOpen ? <FaTimes /> : <FaBars />}
            </div>

            {/* Dropdown Menu */}
            <div className={`nav-dropdown ${menuOpen ? "show" : ""}`}>
                <button onClick={() => handleNavigation("/feed")}>Home</button>
                
                {/* Allow "Create Event" only for Admins & Managers */}
                {(userRole === "admin" || userRole === "manager") && (
                    <button onClick={() => handleNavigation("/create-event")}>Create Event</button>
                )}

                <button onClick={() => handleNavigation("/reports")}>See Reports</button>
                <button onClick={() => handleNavigation("/pending-tasks")}>See Your Tasks</button>
                
                {/* Allow "Manage Events" only for Admins & Managers */}
                {(userRole === "admin" || userRole === "manager") && (
                    <button onClick={() => handleNavigation("/manage-events")}>Manage Your Events</button>
                )}

                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}

export default Navbar;
