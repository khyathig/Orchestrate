require("dotenv").config(); // Load environment variables
const express = require("express");
const {
  createOrder,
  confirmPayment,
} = require("../controllers/paymentController");
const router = express.Router();

// Route to create an order
router.post("/create-order", createOrder);

// Route to confirm payment and RSVP user
router.post("/confirm-payment", confirmPayment);

module.exports = router;