import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/chat", async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log("Received request:", req.body);

        // Send request to the locally running chatbot
        const response = await axios.post("http://localhost:11434/api/generate", {
            model: "my-chatbot",
            prompt: prompt,
            stream: false  // Ensures complete response in one go
        });
        console.log("Chatbot response:", response.data); // Log chatbot response
        res.json(response.data); // Forward chatbot response to frontend
    } catch (error) {
        console.error("Chatbot API Error:", error);
        res.status(500).json({ error: "Chatbot request failed" });
    }
});

export default router;
