/**
 * Login Component
 * This component renders a login form that allows users to authenticate using their email and password. 
 * It handles form submission, interacts with the backend API for login, stores the user's token and data in 
 * localStorage, and redirects to the feed page upon successful login. If already logged in, the user is redirected 
 * to the feed page immediately.
 * 
 * @component
 * 
 * @example
 * // Usage of Login component
 * <Login setLoggedInUser={setLoggedInUser} />
 */

import React, { useState, useEffect } from "react";// Import React hooks for state and side effects
import axios from "axios";// Import Axios for making HTTP requests
import { useNavigate } from "react-router-dom";// Import navigation hook for routing
import "../styles/Login.css"; // Import CSS for styling

// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
/**
 * Handles user login and redirects upon successful authentication.
 * 
 * @function
 * @param {Object} props - Component properties
 * @param {function} props.setLoggedInUser - Function to set the logged-in user in the parent component state
 * @returns {JSX.Element} - The rendered Login component
 */
const Login = ({ setLoggedInUser }) => {// Login component with prop to set the logged-in user
    const [email, setEmail] = useState("");// State for storing the email input
    const [password, setPassword] = useState("");// State for storing the password input
    const [error, setError] = useState("");// State for storing login error messages
    const navigate = useNavigate();// Hook to navigate between routes

    // Redirect if already logged in
     /**
     * Redirects to the feed page if the user is already logged in.
     * This effect runs on initial component mount and checks for a valid token in localStorage.
     * 
     * @hook
     * @returns {void}
     */
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/feed");// Navigate to feed if token exists
        }
    }, [navigate]); // Dependency array to avoid unnecessary re-renders
/**
     * Handles the form submission for login.
     * Sends the email and password to the backend API and processes the response.
     * On successful login, stores the token and user data in localStorage and redirects the user.
     * 
     * @async
     * @function
     * @param {Object} e - The event object for the form submission
     * @returns {void}
     */
    const handleLogin = async (e) => {// Function to handle login form submission
        e.preventDefault();           // Prevent page reload on form submit
        setError("");                 // Clear previous errors

        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email,                   // Send email and password to the server
                password,
            });

            const user = res.data.user;    // Extract user info from response
            const token = res.data.token;           // Extract token from response


            if (!user || !token) {      // Handle invalid response
                throw new Error("Invalid response from server");
            }

            // Store user data in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("userEmail", user.email);

            // Set token in Axios for further requests
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            setLoggedInUser(user);    // Update the logged-in user state
            navigate("/feed");         // Redirect to feed page
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="login-wrapper">     {/* Wrapper for the entire login page */}
            {/* Left Side: Branding Section */}
            <div className="login-graphic">
                <div className="app-header">
                    <h1 className="app-title">Orchestrate</h1>
                    <p className="app-subtitle">Streamline your event management experience</p>
                </div>
            </div>

            {/* Right Side: Login Card */}
            <div className="login-form-container">
                <div className="login-card">
                    <h2>Login</h2>    {/* Form heading */}
                    <p className="subtitle">Let's Get Started</p>

                    {error && <div className="error-message">{error}</div>} {/* Display error message */}

                    <form onSubmit={handleLogin}> {/* Form element with submit handler */}
                        <div>
                            <label htmlFor="email">Email</label>{/* Email label */}
                            <input
                                id="email"
                                type="email"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}// Update email state on change
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password">Password</label>{/* Password label */}
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}  // Update password state on change
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn">
                            Login    {/* Submit button */}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
