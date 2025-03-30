const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        const response = await axios.post("http://localhost:11434/api/generate", {
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
