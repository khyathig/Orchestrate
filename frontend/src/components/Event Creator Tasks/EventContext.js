// EventContext.js
/**
 * EventContext.js
 *
 * This module provides the `EventContext` React Context for managing event-related data
 * in the application. It includes functions to fetch events created by an admin and
 * retrieve tasks associated with a specific event.
 *
 * Dependencies:
 * - React (useContext, useState, useEffect, useCallback)
 * - Axios for API requests
 *
 * API Base URL is fetched from environment variables.
 */


import React, { createContext, useState, useEffect, useCallback } from "react";  // Import necessary hooks and React modules
import axios from "axios";                                                       // Import axios for API requests

// ✅ Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ✅ Create EventContext to provide event-related data throughout the app
export const EventContext = createContext();

export const EventProvider = ({ children }) => {
    
    // ✅ State variables
    const [events, setEvents] = useState([]);                 // Store the list of events
    const [loading, setLoading] = useState(false);            // Loading indicator for events
    const [error, setError] = useState(null);                 // Store any loading errors

    const [selectedEventTasks, setSelectedEventTasks] = useState([]);    // Store tasks of a selected event
    const [loadingTasks, setLoadingTasks] = useState(false);             // Loading indicator for event tasks
    const [lastFetchedEventID, setLastFetchedEventID] = useState(null);  // Track last fetched event to avoid redundant API calls

    // ✅ Fetch all events created by the logged-in admin
    const loadEvents = useCallback(async () => {
        setLoading(true);                                   // Set loading state to true
        setError(null);                                     // Reset previous errors
        try {
            const user = localStorage.getItem("user");      // Retrieve user info from localStorage
            if (!user) throw new Error("User not found in local storage");

            const userEmail = JSON.parse(user).email;       // Extract user email from stored user data
            if (!userEmail) throw new Error("User email is missing");

            // ✅ Fetch events created by the admin
            const response = await axios.get(`${API_BASE_URL}/api/admin/created-events`, {
                headers: { "user-email": userEmail }        // Send user email in request headers
            });

            // ✅ Ensure the response contains an array of events
            if (!Array.isArray(response.data)) {
                console.error("Unexpected response format:", response.data);
                throw new Error("Unexpected response format: Expected an array");
            }

            setEvents(response.data);                       // Store fetched events in state
        } catch (err) {
            console.error("Error loading events:", err);    // Log any errors
            setError(err.message);                          // Store error message in state
        } finally {
            setLoading(false);                              // Reset loading state
        }
    }, []);

    // ✅ Fetch tasks for a specific event
    const fetchEventTasks = useCallback(async (eventID) => {
        
        // ✅ Prevent unnecessary re-fetches
        if (!eventID || eventID === lastFetchedEventID) return; 
        
        setLoadingTasks(true);                              // Set loading state for tasks
        try {
            // ✅ Fetch tasks related to the specified event ID
            const response = await axios.get(`${API_BASE_URL}/api/admin/tasks`, {
                params: { eventID }                         // Pass event ID as query parameter
            });

            setSelectedEventTasks(response.data);           // Store fetched tasks
            setLastFetchedEventID(eventID);                 // Update last fetched event ID
        } catch (error) {
            console.error("Error fetching event tasks:", error.response?.data || error.message);
            setSelectedEventTasks([]);                      // Reset tasks on error
        } finally {
            // ✅ Add a small delay for smoother UI transitions
            setTimeout(() => setLoadingTasks(false), 300);  
        }
    }, [lastFetchedEventID]);                               // Re-run only when lastFetchedEventID changes

    // ✅ Load events on component mount
    useEffect(() => {
        loadEvents();
    }, [loadEvents]);                                       // Dependency: `loadEvents`

    return (
        // ✅ Provide event-related data and functions to all children components
        <EventContext.Provider value={{
            events,                      // List of events
            loading,                     // Event loading state
            error,                       // Error state
            loadEvents,                  // Function to reload events
            fetchEventTasks,             // Function to fetch event tasks
            selectedEventTasks,          // Tasks of the selected event
            loadingTasks                  // Loading state for tasks
        }}>
            {children}
        </EventContext.Provider>
    );
};
