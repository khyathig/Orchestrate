import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all events created by the logged-in user
    const loadEvents = useCallback(async () => {
        console.log("🔄 loadEvents() called");
        setLoading(true);
        setError(null); // Clear any previous errors
    
        try {
            const user = localStorage.getItem("user");
            if (!user) throw new Error("User not found in local storage");

            const userEmail = JSON.parse(user).email;
            if (!userEmail) throw new Error("User email is missing");

            const response = await axios.get('http://localhost:5000/api/admin/created-events', {
                headers: { 'user-email': userEmail }
            });

            console.log("📥 Raw API Response:", response);
            
            const eventData = response.data;
            if (!Array.isArray(eventData)) {
                console.error("❌ Expected an array but received:", typeof eventData, eventData);
                throw new Error("Unexpected response format: Expected an array");
            }

            setEvents(eventData);
            console.log("✅ Events fetched successfully:", eventData);
    
        } catch (err) {
            console.error('❌ Error loading events:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch events on mount
    useEffect(() => {
        console.log("🚀 Initializing EventContext, calling loadEvents()");
        loadEvents();
    }, [loadEvents]);

    return (
        <EventContext.Provider value={{ events, loading, error, loadEvents }}>
            {children}
        </EventContext.Provider>
    );
};
