/**
 * @file EventFeed.js
 * @description Component to display events, handle RSVP, filtering, and payments.
 */

import React, { useState, useEffect } from "react";
import RazorpayButton from "./RazorpayButton";
import "../../styles/EventFeed.css";
import NotificationPanel from "./NotificationPanel";

/**
 * Base API URL from environment variables.
 * @constant {string}
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * EventFeed Component
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.loggedInUser - Logged-in user data
 */
function EventFeed({ loggedInUser }) {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [starredEvents, setStarredEvents] = useState(new Set());
  const [selectedFilter, setSelectedFilter] = useState("All Events");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedEventType, setSelectedEventType] = useState("All Types");

  useEffect(() => {
    if (!loggedInUser?.email) return;

    const fetchEventsAndTasks = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user) return;

      try {
        // Fetch Events
        const eventRes = await fetch(`${API_BASE_URL}/api/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Email": user.email,
          },
        });

        if (!eventRes.ok) throw new Error("Failed to fetch events");
        const eventData = await eventRes.json();
        console.log("Fetched Events:", eventData); // Debugging

        // Fetch Tasks
        const taskRes = await fetch(`${API_BASE_URL}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Email": user.email,
          },
        });

        if (!taskRes.ok) throw new Error("Failed to fetch tasks");
        const taskData = await taskRes.json();
        console.log("Fetched Tasks:", taskData); // Debugging

        setEvents(eventData);
        setTasks(taskData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchEventsAndTasks();
  }, [loggedInUser?.email]);

  const toggleStar = (eventId) => {
    const newStars = new Set(starredEvents);
    newStars.has(eventId) ? newStars.delete(eventId) : newStars.add(eventId);
    setStarredEvents(newStars);
  };

  const handleRSVP = async (event) => {
    const token = localStorage.getItem("token");

    if (!loggedInUser?.name) {
      alert("Please log in to RSVP.");
      return;
    }

    try {
      const isRSVPd = event.attendees.includes(loggedInUser.name);
      const endpoint = isRSVPd 
        ? `${API_BASE_URL}/api/events/${event._id}/unrsvp`
        : `${API_BASE_URL}/api/events/${event._id}/rsvp`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: event._id, employeeName: loggedInUser.name }),
      });
      console.log("RSVP Request:", { eventId: event._id, employeeName: loggedInUser.name });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update RSVP status");

      // Update local state to reflect changes
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e._id === event._id
            ? {
                ...e,
                attendees: isRSVPd
                  ? e.attendees.filter((name) => name !== loggedInUser.name) // Remove from attendees
                  : [...e.attendees, loggedInUser.name], // Add to attendees
                availableSlots: isRSVPd ? e.availableSlots + 1 : e.availableSlots - 1, // Adjust slots
              }
            : e
        )
      );
    } catch (error) {
      console.error("RSVP Error:", error.message);
      alert(error.message);
    }
  };

  // Ensure event ID matches task eventID (convert both to strings)
  const isEventCompleted = (eventId) => {
    const eventTasks = tasks.filter((task) => task.eventID?.toString() === eventId?.toString());
    return eventTasks.length > 0 && eventTasks.every((task) => task.status === "Completed");
  };

  const filteredEvents = events
    .filter((event) => isEventCompleted(event._id)) // Only show completed events
    .filter((event) => {
      const isStarred = starredEvents.has(event._id);
      const isUserAttendee = event.attendees.some(
        (attendee) => attendee.toLowerCase() === loggedInUser?.name.toLowerCase()
      );

      if (selectedFilter === "RSVP'd") {
        return isUserAttendee;
      }

      if (selectedFilter === "Starred") {
        return isStarred;
      }

      return true; // Show all events by default
    })
    .filter((event) =>
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (event) =>
        selectedYear === "All Years" ||
        new Date(event.date).getFullYear().toString() === selectedYear
    )
    .filter(
      (event) => selectedEventType === "All Types" || event.eventType === selectedEventType
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sorting latest events first

  const isEventInPast = (eventDate) => {
    return new Date(eventDate) < new Date(); // Compare event date with current date
  };

  return (
    <div className="event-feed-container">
      <h2 className="section-title">Events</h2> {/* Moved here */}
  
      <div className="filter-search-inline">
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search events by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            className="filter-dropdown"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="All Events">All Events</option>
            <option value="RSVP'd">RSVP'd</option>
            <option value="Starred">Starred</option>
          </select>
          <select
            className="filter-dropdown"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="All Years">All Years</option>
            {[...new Set(events.map((event) => new Date(event.date).getFullYear().toString()))].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            className="filter-dropdown"
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
          >
            <option value="All Types">All Event Types</option>
            {[...new Set(events.map((event) => event.eventType))].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
  
      <div className="content-wrapper">
        <div className="event-feed">
          <div className="event-list">
            {filteredEvents.length === 0 ? (
              <p>No matching events found.</p>
            ) : (
              filteredEvents.map((event) => (
                <div key={event._id} className="event-card">
                  <div className="event-header">
                    <h3 className="event-title">{event.eventName}</h3>
                    <span
                      onClick={() => toggleStar(event._id)}
                      className={`star-icon ${starredEvents.has(event._id) ? "starred" : ""}`}
                      title={starredEvents.has(event._id) ? "Unstar" : "Star"}
                    >
                      {starredEvents.has(event._id) ? "⭐" : "☆"}
                    </span>
                  </div>
  
                  <p>{event.description}</p>
                  <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString("en-GB")}</p>
                  <p><strong>Venue:</strong> {event.venue}</p>
  
                  {event.eventType === "limited-entry" && (
                    <>
                      {event.availableSlots !== null && (
                        <p><strong>Available Slots:</strong> {event.availableSlots}</p>
                      )}
                      {event.ticketPrice !== undefined && (
                        <p><strong>Ticket Price:</strong> ₹{event.ticketPrice}</p>
                      )}
                    </>
                  )}
  
                  {isEventInPast(event.date) ? (
                    <p className="event-past">This event has already passed.</p>
                  ) : (
                    event.eventType === "limited-entry" && (
                      event.ticketPrice > 0 ? (
                        <RazorpayButton event={event} loggedInUser={loggedInUser} />
                      ) : (
                        <button
                          className={`rsvp-button ${event.attendees.includes(loggedInUser?.name) ? "rsvped" : ""}`}
                          onClick={() => handleRSVP(event)}
                        >
                          {event.attendees.includes(loggedInUser?.name) ? "RSVP’d" : "RSVP"}
                        </button>
                      )
                    )
                  )}
                </div>
              ))
            )}
          </div>
        </div>
  
        <div className="notification-panel">
          <h2>Notifications</h2>
          <NotificationPanel loggedInUser={loggedInUser} />
        </div>
      </div>
    </div>
  );  
}

export default EventFeed;
