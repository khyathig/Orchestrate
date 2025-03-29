require("dotenv").config();
console.log("🔍 Razorpay Key ID:", process.env.RAZORPAY_KEY_ID); 
const axios = require("axios");
const Event = require("../models/Event");
const Employee = require("../models/Employee");
const crypto = require("crypto");

// Create a Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const razorpayAuth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    console.log("🔍 Sending API request with Key ID:", process.env.RAZORPAY_KEY_ID);

    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: req.body.amount * 100, // Convert to paisa
        currency: "INR",
        receipt: req.body.receipt || "receipt#1",
        payment_capture: 1
      },
      {
        headers: {
          "Authorization": `Basic ${razorpayAuth}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Order Created:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Razorpay Authentication Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// Confirm Payment and RSVP
exports.confirmPayment = async (req, res) => {
  const { eventId, employeeEmail, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!employeeEmail) {
    return res.status(400).json({ message: "Employee email is required for RSVP." });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const employee = await Employee.findOne({ email: employeeEmail }).select("_id");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (event.attendees.includes(employeeEmail)) {
      return res.status(400).json({ message: "You have already RSVP’d to this event." });
    }

    if (event.availableSlots !== null && event.availableSlots <= 0) {
      return res.status(400).json({ message: "No slots available." });
    }

    // Verify Razorpay Payment Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("🔍 Expected Signature:", expectedSignature);
    console.log("🔍 Received Signature:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
    }

    // Payment verified! Add user to attendees list and decrement slots
    event.attendees.push(employeeEmail);
    if (event.availableSlots !== null) {
      event.availableSlots -= 1;
    }

    await event.save();
    res.status(200).json({ message: "Payment confirmed, RSVP successful", event });
  } catch (error) {
    console.error(" Payment Confirmation Error:", error.message);
    res.status(500).json({ message: "Server error", error });
  }
};
