import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/EventFeed.css";

// Use API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const RazorpayButton = ({ event, loggedInUser }) => {
    const [isRSVPd, setIsRSVPd] = useState(false);

    // Check if the user has already RSVP'd
    useEffect(() => {
        if (!event?.attendees || !loggedInUser) return;

        const isUserAttendee = event.attendees.some(
            (attendee) =>
                attendee.toLowerCase() === loggedInUser?.email.toLowerCase() || 
                attendee.toLowerCase() === loggedInUser?.name.toLowerCase()
        );

        setIsRSVPd(isUserAttendee);
    }, [event, loggedInUser]);

    if (!event) {
        return null;
    }

    const handlePayment = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: event.ticketPrice }),
            });

            const order = await response.json();

            const options = {
                key: "rzp_test_fTYhwgXS3lhJzR",
                amount: order.amount,
                currency: "INR",
                name: "Orchestrate",
                description: event.eventName,
                order_id: order.id,
                handler: async function (response) {
                    console.log("Payment Success Response:", response);

                    try {
                        const res = await axios.post(
                            `${API_BASE_URL}/api/payment/confirm-payment`,
                            {
                                eventId: event._id,
                                employeeEmail: loggedInUser?.email,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            },
                            {
                                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                            }
                        );

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
