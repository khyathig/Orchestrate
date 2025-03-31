/**
 * Chat Component
 *
 * This component renders a chatbot interface that allows users to send messages and receive responses.
 * The chatbot initially displays a greeting message and communicates with a backend API to fetch responses.
 *
 * @component
 * @returns {JSX.Element} A chat interface component.
 */
import React, { useState, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import "../../styles/Chat.css"; // Ensure this path is correct

const Chat = () => {
    /**
     * State to manage chat messages.
     * @type {[Array<{sender: string, text: string}>, Function]}
     */
    const [messages, setMessages] = useState([]);

    /**
     * State to manage user input.
     * @type {[string, Function]}
     */
    const [input, setInput] = useState("");

    /**
     * State to track loading status when fetching bot responses.
     * @type {[boolean, Function]}
     */
    const [loading, setLoading] = useState(false);

    /**
     * State to control the visibility of the chat window.
     * @type {[boolean, Function]}
     */
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Initializes chat with a welcome message when the component mounts.
     */
    useEffect(() => {
        setMessages([{ sender: "bot", text: "**Hello! 😊**\n\nHow can I assist you today?" }]);
    }, []);

    /**
     * Sends a user message to the backend API and receives a bot response.
     *
     * @async
     * @function
     */
    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            if (!response.ok) throw new Error("Failed to fetch");

            const data = await response.json();
            const botMessage = { sender: "bot", text: data.response || "**Sorry, I didn't get that.**" };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [...prev, { sender: "bot", text: "**Oops! Something went wrong.** 😕\n\nPlease try again." }]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles the Enter key press event to send messages.
     *
     * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event object.
     */
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && input.trim()) {
            sendMessage();
        }
    };

    return (
        <div>
            {!isOpen && (
                <div className="chat-bubble" onClick={() => setIsOpen(true)}>💬</div>
            )}
            {isOpen && (
                <div className="chat-overlay">
                    <div className="chat-window">
                        <div className="chat-header">
                            Chat Assistant
                            <button className="close-button" onClick={() => setIsOpen(false)}>✖</button>
                        </div>
                        <div className="chat-box">
                            {messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.sender === "user" ? "user" : "bot"}`}>
                                    <ChatMessage message={msg} />
                                </div>
                            ))}
                            {loading && <div className="typing-indicator">🤖 *Typing...*</div>}
                        </div>
                        <div className="chat-input">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type a message..."
                            />
                            <button onClick={sendMessage} disabled={loading}>Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;