
require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/taskRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/createdEventRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();  //  Define app first
const server = http.createServer(app);  //  Correct server initialization

//  Initialize Socket.IO after defining app
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",  //  Allow frontend to connect
    methods: ["GET", "POST"]
  }
});

//  Attach io to the request object so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

//  Handle WebSocket Connections
io.on("connection", (socket) => {
  console.log(" User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.id);
  });
});

//  Middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(bodyParser.json());

//  MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(" MongoDB Connected"))
  .catch(err => console.error(" MongoDB Connection Error:", err));

//  Define Routes After Middleware
app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/tasks", taskRoutes);

// Start HTTP Server (Not app.listen())
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` Server running on port ${PORT}`));
