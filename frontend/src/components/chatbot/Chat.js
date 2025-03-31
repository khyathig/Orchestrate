import React, { useState, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import "../../styles/Chat.css"; // Ensure this path is correct

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setMessages([{ sender: "bot", text: "**Hello! 😊**\n\nHow can I assist you today?" }]);
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/chat", {  // Call the backend, not chatbot

                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,  // <-- Correct key
                }),                
            });

            if (!response.ok) throw new Error("Failed to fetch");

            const data = await response.json();
            const botMessage = { sender: "bot", text: data.response || "**Sorry, I didn't get that.**" };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "**Oops! Something went wrong.** 😕\n\nPlease try again." }
            ]);
        } finally {
            setLoading(false);
        }
    };

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
