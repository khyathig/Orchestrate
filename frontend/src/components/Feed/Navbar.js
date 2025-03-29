import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; 
import "../../styles/Navbar.css";

function Navbar({ handleLogout, userRole }) {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleNavigation = (path) => {
        navigate(path);
        
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
