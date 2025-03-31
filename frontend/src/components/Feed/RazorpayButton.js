import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/EventFeed.css";

// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const RazorpayButton = ({ event, loggedInUser }) => {
    const [isRSVPd, setIsRSVPd] = useState(false);// State to track if the user has RSVP'd

    // Check if the user has already RSVP'd
    useEffect(() => {
        if (!event?.attendees || !loggedInUser) return;

        const isUserAttendee = event.attendees.some(
            (attendee) =>
                attendee.toLowerCase() === loggedInUser?.email.toLowerCase() || // Match by email
                attendee.toLowerCase() === loggedInUser?.name.toLowerCase()// Match by name
        );

        setIsRSVPd(isUserAttendee);// Update RSVP status
    }, [event, loggedInUser]);

    if (!event) {
        return null;
    }
// Handle the payment process
    const handlePayment = async () => {
        try {
             // Create order by making a POST request to the backend
             const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: event.ticketPrice }), // Ensure correct conversion
            });            

            const order = await response.json();// Parse the order details

            const options = {
                key: "rzp_test_fTYhwgXS3lhJzR",// Razorpay test key
                amount: order.amount,
                currency: "INR",
                name: "Orchestrate",
                description: event.eventName, // Event name as description
                order_id: order.id,// order ID from the backend
                handler: async function (response) {
                    console.log("Payment Success Response:", response);

                    try {
                        
                        // Send payment confirmation to the backend
                        const res = await axios.post(
                            `${API_BASE_URL}/api/payment/confirm-payment`,
                            {
                                eventId: event._id,// Event ID
                                employeeEmail: loggedInUser?.email,// User's email
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            },
                            {
                                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                            }
                        );
                    // If payment is successful, show success message
                        if (res.status === 200) {
                            alert("Payment successful! RSVP confirmed.");
                            setIsRSVPd(true);
                        } else {
                            alert(res.data.message || "Payment successful, but RSVP failed.");
                        }
                    } catch (error) {
                        console.error("Payment verification failed:", error.response?.data || error.message);
                        alert(error.response?.data?.message || "Payment verification failed.");
                    }
                },
                prefill: {
                    name: loggedInUser?.name || "Guest",
                    email: loggedInUser?.email || "guest@example.com",
                    contact: "9999999999",
                },
                theme: { color: "#3399cc" },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error("Error initializing payment:", error);
            alert("Error initializing payment.");
        }
    };

    return (
        <button 
            onClick={handlePayment} 
            className={`pay-btn ${isRSVPd ? "disabled-btn" : ""}`} 
            disabled={isRSVPd}
        >
            {isRSVPd ? "RSVP'd" : `Pay ₹${event.ticketPrice}`}
        </button>
    );
};

export default RazorpayButton;
