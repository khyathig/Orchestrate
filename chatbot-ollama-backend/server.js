import express from "express";
import cors from "cors";
import chatRoutes from "./chat.js"; // Import chatbot route

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend to access backend

app.use("/api", chatRoutes); // Set up API routes

const PORT = 5000; // Use port 5000 for backend
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
