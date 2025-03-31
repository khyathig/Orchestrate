const express = require("express");
const axios = require("axios");

const router = express.Router();

/**
 * @route POST /
 * @description Handles chat requests, sends the message to an external chatbot API, and returns the response.
 * @access Public
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body containing the message.
 * @param {string} req.body.message - The message sent by the user to the chatbot.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response containing the chatbot's reply.
 */

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        const response = await axios.post("http://localhost:11434/api/generate", {  // Change the port to 7000
            model: "my-chatbot",
            prompt: message,
            stream: false,
        });

        res.json({ response: response.data.response });
    } catch (error) {
        console.error("Error in chat API:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;
