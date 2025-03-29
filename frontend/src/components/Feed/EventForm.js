import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/EventForm.css";

// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function EventForm(userRole ) {
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [eventType, setEventType] = useState(userRole === "manager" ? "limited-entry" : "firm-wide"); 
  const [availableSlots, setAvailableSlots] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [team, setTeam] = useState("");
  const [tasks, setTasks] = useState([{ taskName: "", description: "", assignee: "", deadline: "", budget: "" }]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validate number fields
  const validateNumber = (value) => /^[0-9]*$/.test(value);

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
          <label>Event Type</label>
          <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
            {/* Show "Firm-Wide" ONLY for admins */}
            {userRole !== "manager" && <option value="firm-wide">Firm-Wide</option>}
            <option value="limited-entry">Limited Entry</option>
            <option value="team-specific">Team-Specific</option>
          </select>
        </div>

        {eventType === 'limited-entry' && (
          <>
            <div className="form-group">
              <label>Available Slots</label>
              <input type="text" placeholder="Available Slots" value={availableSlots} onChange={(e) => {
                if (validateNumber(e.target.value, 'availableSlots')) setAvailableSlots(e.target.value);
              }} required />
              {errors.availableSlots && <p className="error">{errors.availableSlots}</p>}
            </div>
            <div className="form-group">
              <label>Ticket Price (optional)</label>
              <input type="text" placeholder="Ticket Price" value={ticketPrice} onChange={(e) => {
                if (validateNumber(e.target.value, 'ticketPrice')) setTicketPrice(e.target.value);
              }} />
              {errors.ticketPrice && <p className="error">{errors.ticketPrice}</p>}
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
            <input type="text" placeholder="Budget" value={task.budget} onChange={(e) => {
              if (validateNumber(e.target.value, `budget-${index}`)) handleTaskChange(index, 'budget', e.target.value);
            }} />
            {errors[`budget-${index}`] && <p className="error">{errors[`budget-${index}`]}</p>}
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
