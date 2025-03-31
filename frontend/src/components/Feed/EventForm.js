/**
 * EventForm Component for creating events with dynamic task management.
 * 
 * This component allows users to create events, specify event details, and manage tasks related to the event.
 * The form adjusts the available fields based on the user's role (e.g., manager vs non-manager).
 * It handles task creation, input validation, and form submission to an API.
 * 
 * @component
 * @example
 * return <EventForm userRole="manager" />;
 * 
 * @param {Object} props - The component props.
 * @param {string} props.userRole - The role of the user (e.g., 'manager' or 'employee').
 */

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/EventForm.css";

// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function EventForm({userRole}) {
  const [eventName, setEventName] = useState(""); //event name 
  const [description, setDescription] = useState("");// event description
  const [venue, setVenue] = useState("");// event venue
  const [date, setDate] = useState("");// eventdate
  const [eventType, setEventType] = useState();//event type
  const [availableSlots, setAvailableSlots] = useState("");//available slots 
  const [ticketPrice, setTicketPrice] = useState("");//ticket price
  const [team, setTeam] = useState("");// team name 
  const [totalBudget, setTotalBudget] = useState("");// event budget

  //task array with initial empty task 
  const [tasks, setTasks] = useState([{ taskName: "", description: "", assignee: "", deadline: "", budget: "" }]);
  const [errors, setErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({}); // Added state for validation errors
  const navigate = useNavigate();

  /**
   * Effect hook to set the initial event type based on user role
   * If userRole is "manager", default eventType is "limited-entry", otherwise "firm-wide"
   */
  // Ensure eventType is properly set based on userRole when the component mounts
  useEffect(() => {
    if (userRole === "manager") {
      setEventType("limited-entry");
    } else {
      setEventType("firm-wide");
    }
  }, [userRole]);

  // Validate number fields
  const handleNumberChange = (value, field) => {
    if (/^\d*$/.test(value)) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" })); // Corrected to setValidationErrors
      return value;
    } else {
      setValidationErrors((prev) => ({ ...prev, [field]: "Invalid entry: Only numbers allowed" })); // Corrected to setValidationErrors
      return value;
    }
  };

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  const addTask = () => {
    setTasks([...tasks, { taskName: "", description: "", assignee: "", deadline: "", budget: "" }]);
  };

  const removeTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  const validateDeadlines = () => {
    const eventDeadline = new Date(date);
    for (const task of tasks) {
      if (task.deadline) {
        const taskDeadline = new Date(task.deadline);
        if (taskDeadline >= eventDeadline) {
          alert(`Task deadline for "${task.taskName}" must be before the event date.`);
          return false;
        }
      }
    }
    return true;
  };
/**
   * Handles form submission. Sends the event data to the server and creates the event.
   * If validation fails (e.g., task deadline), the form won't submit.
   * @param {Object} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateDeadlines()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication error. Please log in again.");
      navigate("/login");
      return;
    }

    const formattedTasks = tasks.map(task => ({
      taskName: task.taskName,
      description: task.description,
      assignee: task.assignee,
      deadline: task.deadline,
      budget: task.budget ? Number(task.budget) : 0,
    }));

    const newEvent = {
      eventName,
      description,
      venue,
      date,
      eventType,
      availableSlots: eventType === "limited-entry" ? Number(availableSlots) : null,
      ticketPrice: eventType === "limited-entry" ? Number(ticketPrice) : null,
      team: eventType === "team-specific" ? team : "",
      tasks: formattedTasks,
      totalBudget: totalBudget ? Number(totalBudget) : 0,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/events`,
        newEvent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Event created successfully!");
      console.log("Event Response:", response.data);
      navigate("/feed");
    } catch (error) {
      console.error("Error creating event:", error);
      const errorMessage = error.response?.data?.error || error.message;
      setErrors({ message: errorMessage });
      alert(`Error creating event: ${errorMessage}`);
    }
  };

  return (
    <div className="form-container">
      <h2>Create Event</h2>

      {/* Display general error message if any */}
      {errors.message && <div className="error-message">{errors.message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Event Name</label>
          <input type="text" placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Venue</label>
          <input type="text" placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Total Budget (optional)</label>
          <input
            type="text"
            placeholder="Total Budget"
            value={totalBudget}
            onChange={(e) => setTotalBudget(handleNumberChange(e.target.value, "totalBudget"))}
            className={validationErrors.totalBudget ? "input-error" : ""}
          />
          {validationErrors.totalBudget && <span className="error-text">{validationErrors.totalBudget}</span>}
        </div>
        <div className="form-group">
  <label>Event Type</label>
  <select
    value={eventType}
    onChange={(e) => setEventType(e.target.value)}
  >
    {/* Show "Firm-Wide" ONLY for non-managers */}
    {userRole !== "manager" && <option value="firm-wide">Firm-Wide</option>}
    <option value="limited-entry">Limited Entry</option>
    <option value="team-specific">Team-Specific</option>
  </select>
</div>

        {eventType === 'limited-entry' && (
          <>
            <div className="form-group">
              <label>Available Slots</label>
              <input
                type="text"
                placeholder="Available Slots"
                value={availableSlots}
                onChange={(e) => setAvailableSlots(handleNumberChange(e.target.value, "availableSlots"))}
                className={validationErrors.availableSlots ? "input-error" : ""}
                required
              />
              {validationErrors.availableSlots && <span className="error-text">{validationErrors.availableSlots}</span>}
            </div>
            <div className="form-group">
              <label>Ticket Price (optional)</label>
              <input
                type="text"
                placeholder="Ticket Price"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(handleNumberChange(e.target.value, "ticketPrice"))}
                className={validationErrors.ticketPrice ? "input-error" : ""}
              />
              {validationErrors.ticketPrice && <span className="error-text">{validationErrors.ticketPrice}</span>}
            </div>
          </>
        )}

        {eventType === 'team-specific' && (
          <div className="form-group">
            <label>Team</label>
            <input type="text" placeholder="Team" value={team} onChange={(e) => setTeam(e.target.value)} required />
          </div>
        )}

        <h3>Tasks</h3>
        {tasks.map((task, index) => (
          <div key={index} className="task-container">
            <input type="text" placeholder="Task Name" value={task.taskName} onChange={(e) => handleTaskChange(index, 'taskName', e.target.value)} required />
            <input type="text" placeholder="Description" value={task.description} onChange={(e) => handleTaskChange(index, 'description', e.target.value)} />
            <input type="email" placeholder="Assigned To (Email)" value={task.assignee} onChange={(e) => handleTaskChange(index, 'assignee', e.target.value)} required />
            <input type="date" placeholder="Task Deadline" value={task.deadline} onChange={(e) => handleTaskChange(index, 'deadline', e.target.value)} />
            <input
              type="text"
              placeholder="Budget"
              value={task.budget}
              onChange={(e) => handleTaskChange(index, 'budget', handleNumberChange(e.target.value, `task-${index}-budget`))}
              className={validationErrors[`task-${index}-budget`] ? "input-error" : ""}
            />
            {validationErrors[`task-${index}-budget`] && <span className="error-text">{validationErrors[`task-${index}-budget`]}</span>}
            <button type="button" onClick={() => removeTask(index)}>Remove Task</button>
          </div>
        ))}

        <button type="button" onClick={addTask} className="add-task">Add Task</button>
        <button type="submit" className="submit-event">Create Event</button>
      </form>
    </div>
  );
}

export default EventForm;