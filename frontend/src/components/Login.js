import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = ({ setLoggedInUser }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/feed");
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        
        try {
            const res = await axios.post("https://orchestrate-1.onrender.com/api/auth/login", {
                email,
                password,
            });
        
            const user = res.data.user;
            const token = res.data.token;
        
            if (!user || !token) {
                throw new Error("Invalid response from server");
            }
        
            // Store user data in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("userEmail", user.email);
        
            // Set token in Axios for further requests
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
            setLoggedInUser(user);
            navigate("/feed");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="login-wrapper">
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
                    <h2>Login</h2>
                    <p className="subtitle">Let's Get Started</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
