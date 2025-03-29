import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedEventTasks, setSelectedEventTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [lastFetchedEventID, setLastFetchedEventID] = useState(null); // Track last fetched event

    const loadEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const user = localStorage.getItem("user");
            if (!user) throw new Error("User not found in local storage");

            const userEmail = JSON.parse(user).email;
            if (!userEmail) throw new Error("User email is missing");

            const response = await axios.get("http://localhost:5000/api/admin/created-events", {
                headers: { "user-email": userEmail }
            });

            if (!Array.isArray(response.data)) {
                console.error("Unexpected response format:", response.data);
                throw new Error("Unexpected response format: Expected an array");
            }

            setEvents(response.data);
        } catch (err) {
            console.error("Error loading events:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchEventTasks = useCallback(async (eventID) => {
        if (!eventID || eventID === lastFetchedEventID) return; // Prevent unnecessary re-fetches
        
        setLoadingTasks(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/admin/tasks`, {
                params: { eventID }
            });
            setSelectedEventTasks(response.data);
            setLastFetchedEventID(eventID); // Store last fetched event ID
        } catch (error) {
            console.error("Error fetching event tasks:", error.response?.data || error.message);
            setSelectedEventTasks([]);
        } finally {
            setTimeout(() => setLoadingTasks(false), 300); // Smooth UI transition
        }
    }, [lastFetchedEventID]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    return (
        <EventContext.Provider value={{
            events,
            loading,
            error,
            loadEvents,
            fetchEventTasks,
            selectedEventTasks,
            loadingTasks
        }}>
            {children}
        </EventContext.Provider>
    );
};
