require("dotenv").config(); // Load environment variables
const express = require("express");
const {
  createOrder,
  confirmPayment,
} = require("../controllers/paymentController");
const router = express.Router();

/**
 * @route POST /create-order
 * @description Creates a new payment order.
 * @access Public
 * @param {Object} req - Express request object containing order details.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the order details or confirmation.
 * @returns {500} Server error if there is an issue with creating the order.
 */

// Route to create an order
router.post("/create-order", createOrder);

/**
 * @route POST /confirm-payment
 * @description Confirms the payment and RSVPs the user to the event.
 * @access Public
 * @param {Object} req - Express request object containing payment confirmation details.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response confirming the payment and RSVP status.
 * @returns {400} Bad request if the payment confirmation fails.
 * @returns {500} Server error if there is an issue with confirming payment.
 */

// Route to confirm payment and RSVP user
router.post("/confirm-payment", confirmPayment);

module.exports = router;
