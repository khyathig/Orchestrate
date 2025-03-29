require("dotenv").config();
const mongoose = require('mongoose');
const Event = require("../models/Event");
const Task = require("../models/Task");
const Employee = require("../models/Employee");
const { sendEmail } = require("../services/emailService");

exports.createEvent = async (req, res) => {
    try {
        const { eventName, eventType, date, venue, description, availableSlots, ticketPrice, team, tasks } = req.body;

        if (eventType.toLowerCase() === "team-specific" && !team) {
            return res.status(400).json({ error: "Team is required for team-specific events." });
        }

        if (!Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({ error: "At least one task must be assigned to create an event." });
        }

        // Get the creator from authenticated user
        const creatorEmail = req.user.email;

        // Create the event and get its ID
        const event = new Event({
            eventName,
            eventType,
            date,
            venue,
            description,
            availableSlots,
            ticketPrice,
            team: eventType.toLowerCase() === "team-specific" ? team : "",
            isPaid: eventType.toLowerCase() === "limited-entry",
            creator: creatorEmail,
        });

        await event.save();
        console.log("Event created successfully with ID:", event._id);

        // Save tasks with eventID and assigner
        const taskPromises = tasks.map(async (task) => {
            const { taskName, description, deadline, budget, assignee } = task;

            const newTask = new Task({
                taskName,
                description,
                eventName,
                deadline,
                budget,
                creator: creatorEmail, // Creator is the logged-in user
                assignee: assignee,
                eventID: event._id, // Link the task to the created event
            });

            await newTask.save();
            console.log("Task created for event:", eventName);

            // Send email notification
            const employee = await Employee.findOne({ email: assignee });
            if (employee) {
                const emailText = `Dear ${employee.name},
You have been assigned a new task as part of the event "${eventName}". Please review the task details below:

Task Name: ${taskName}
Description: ${description}
Deadline: ${deadline ? deadline : "Not specified"}
Budget: ${budget ? budget : "Not applicable"}

We kindly request that you review the task details and take the necessary actions to complete it by the stated deadline. Should you require further clarification, please do not hesitate to reach out to your supervisor.

Best regards,
Orchestrate`;

                return sendEmail(assignee, `New Task Assigned: ${eventName}`, emailText);
            }
        });

        await Promise.all(taskPromises);

        res.status(201).json({ message: "Event created and tasks assigned successfully", event });
    } catch (error) {
        console.error("Error creating event:", error.message);
        res.status(500).json({ error: error.message });
    }
};


// Get All Events
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find(); // Fetch all events
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

// RSVP to an Event (Only for Unpaid Events)
exports.confirmRSVP = async (req, res) => {
    const { eventId, employeeName } = req.body;

    try {
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        if (event.eventType !== "limited-entry") {
            return res.status(400).json({ message: "RSVP not allowed for this event type" });
        }

        // Check if the event is unpaid (ticketPrice should be null or 0)
        if (event.ticketPrice !== null && event.ticketPrice > 0) {
            return res.status(400).json({ message: "RSVP is only allowed for unpaid events." });
        }

        if (event.attendees.includes(employeeName)) {
            return res.status(400).json({ message: "You have already RSVP’d for this event." });
        }

        if (event.availableSlots !== null && event.availableSlots === 0) {
            return res.status(400).json({ message: "No slots available" });
        }

        // Mark RSVP successful
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            {
                $push: { attendees: employeeName },
                $inc: { availableSlots: -1 },
            },
            { new: true }
        );

        res.status(200).json({ message: "RSVP successful", availableSlots: updatedEvent.availableSlots });
    } catch (error) {
        console.error("RSVP Error:", error.message);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

// Un-RSVP from an Event (Only for Unpaid Events)
exports.unRSVP = async (req, res) => {
    const { eventId, employeeName } = req.body;

    try {
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        if (event.eventType !== "limited-entry") {
            return res.status(400).json({ message: "Un-RSVP not allowed for this event type" });
        }

        // Check if the event is unpaid (ticketPrice should be null or 0)
        if (event.ticketPrice !== null && event.ticketPrice > 0) {
            return res.status(400).json({ message: "Un-RSVP is only allowed for unpaid events." });
        }

        if (!event.attendees.includes(employeeName)) {
            return res.status(400).json({ message: "You have not RSVP'd for this event." });
        }

        // Remove the employee from the attendees list and increase available slots
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            {
                $pull: { attendees: employeeName },
                $inc: { availableSlots: 1 },
            },
            { new: true }
        );

        res.status(200).json({ message: "RSVP cancelled successfully", availableSlots: updatedEvent.availableSlots });
    } catch (error) {
        console.error("Un-RSVP Error:", error.message);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

exports.getDetailedReport = async (req, res) => {
  try {
    const { eventName, year, team } = req.query;
    const query = {};

    // Apply query filters
    if (eventName) query.eventName = { $regex: new RegExp(eventName, "i") }; // Partial match
    if (team) query.team = { $regex: new RegExp(team, "i") }; // Partial match

    if (year) {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
      query.date = { $gte: startOfYear, $lte: endOfYear }; 
    }

    console.log("Generated Event Query:", JSON.stringify(query, null, 2));

    const events = await Event.find(query);
    if (!events.length) {
      console.log("No events found with the specified criteria.");
      return res.status(404).json({ message: "No events found with the specified criteria." });
    }

    console.log(`Fetched ${events.length} events for detailed report.`);

    const reportData = await Promise.all(events.map(async (event) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(event._id)) {
          console.error(`Invalid ObjectId for event: ${event.eventName}, ID: ${event._id}`);
          return null;
        }

        console.log(`Fetching tasks for event: ${event.eventName}, ID: ${event._id}`);

        const tasks = await Task.find({ eventID: event._id });

        // Log task fetching
        console.log(`Tasks found for ${event.eventName}: ${tasks.length}`);

        // Calculate task metrics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === "Completed").length;
        const inProgressTasks = tasks.filter(task => task.status === "In Progress").length;
        const pendingTasks = tasks.filter(task => task.status === "Pending").length;
        const taskCompletionRate = totalTasks ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;

        // Attendance calculations
        const totalAttended = event.attendees?.length || 0;
        const totalRSVP = event.totalRSVP || totalAttended; // Ensure proper RSVP count
        const attendancePercentage = totalRSVP > 0
          ? ((totalAttended / totalRSVP) * 100).toFixed(2)
          : '0.00';

        console.log(`Event: ${event.eventName}, Completed: ${completedTasks}, Pending: ${pendingTasks}, In Progress: ${inProgressTasks}`);

        return {
          eventName: event.eventName,
          year: event.date?.getFullYear(),
          team: event.team,
          eventType: event.eventType,
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          taskCompletionRate,
          totalBudget: event.totalBudget || 0,
          totalRSVP,
          totalAttended,
          attendancePercentage,
        };
      } catch (taskError) {
        console.error(`Error fetching tasks for event ${event.eventName}:`, taskError.message);
        return null;
      }
    }));

    res.status(200).json(reportData.filter(data => data !== null));
  } catch (error) {
    console.error("Error generating detailed report:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get Compiled Event Report
exports.getCompiledReport = async (req, res) => {
    try {
      const { eventName, year, team, eventType } = req.query;
      const query = {};
  
      // Dynamically apply filters
      if (eventName) {
        query.eventName = { $regex: eventName, $options: "i" };
      }
      if (team) {
        query.team = { $regex: new RegExp(`^${team}$`, "i") };
      }
      if (eventType) {
        query.eventType = { $regex: new RegExp(`^${eventType}$`, "i") };
      }
      if (year && /^\d{4}$/.test(year)) {
        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
        query.date = { $gte: startOfYear, $lte: endOfYear };
      } else if (year) {
        return res.status(400).json({ error: "Invalid year format. Please provide a 4-digit year." });
      }
  
      console.log("Generated Query:", query);
  
      // Fetch matching events
      const events = await Event.find(query);
  
      if (!events || events.length === 0) {
        return res.status(404).json({ message: "No events found with the specified criteria." });
      }
  
      // Generate reports for each matching event using totalBudget directly from events
      const reportData = events.map((event) => ({
        eventName: event.eventName,
        year: event.date?.getFullYear(),
        team: event.team,
        eventType: event.eventType,
        totalTasks: 0,
        completedTasks: 0,
        taskCompletionRate: 0,
        totalBudget: event.totalBudget || 0,
      }));
  
      res.status(200).json(reportData);
    } catch (error) {
      console.error("Error generating compiled report:", error.message);
      res.status(500).json({ error: error.message });
    }
  };
  
