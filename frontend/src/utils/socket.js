import { io } from "socket.io-client";

const socket = io("https://orchestrate-1.onrender.com");

socket.on("connect", () => {
  console.log("Connected to WebSocket server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});

export default socket;
