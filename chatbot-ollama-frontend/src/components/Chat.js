import React, { useState, useEffect } from "react";
import ChatMessage from "./ChatMessage";

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
            const response = await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "my-chatbot",
                    prompt: input,
                    stream: false,
                }),
            });

            const data = await response.json();
            const botMessage = { sender: "bot", text: data.response };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [...prev, { sender: "bot", text: "**Oops! Something went wrong.** 😕\n\nPlease try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <div>
            {!isOpen && (
                <div style={styles.chatBubble} onClick={() => setIsOpen(true)}>O</div>
            )}
            {isOpen && (
                <div style={styles.chatOverlay}>
                    <div style={styles.chatContainer}>
                        <button style={styles.closeButton} onClick={() => setIsOpen(false)}>✖</button>
                        <div style={styles.chatBox}>
                            {messages.map((msg, index) => (
                                <div key={index} style={{
                                    ...styles.message,
                                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                                    backgroundColor: msg.sender === "user" ? "#e0e0e0" : "#ffffff",
                                    color: "black",
                                }}>
                                    <ChatMessage message={msg} />
                                </div>
                            ))}
                            {loading && <div style={styles.typingIndicator}>🤖 *Typing...*</div>}
                        </div>
                        <div style={styles.inputBox}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                style={styles.input}
                                placeholder="Type a message..."
                            />
                            <button onClick={sendMessage} style={styles.sendButton}>Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    chatBubble: {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "50px",
        height: "50px",
        backgroundColor: "#007bff",
        color: "white",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
        cursor: "pointer",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    chatOverlay: {
        position: "fixed",
        top: 0,
        right: 0,
        width: "50%",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 1)",
        boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
    },
    chatContainer: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
    },
    closeButton: {
        alignSelf: "flex-end",
        margin: "10px",
        background: "none",
        border: "none",
        fontSize: "20px",
        cursor: "pointer",
    },
    chatBox: {
        flex: 1,
        overflowY: "auto",
        padding: "15px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    message: {
        maxWidth: "75%",
        padding: "10px 15px",
        borderRadius: "15px",
        wordWrap: "break-word",
    },
    typingIndicator: {
        alignSelf: "flex-start",
        fontStyle: "italic",
        color: "#888",
    },
    inputBox: {
        display: "flex",
        padding: "10px",
        borderTop: "1px solid #ddd",
        backgroundColor: "#f9f9f9",
    },
    input: {
        flex: 1,
        padding: "10px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    sendButton: {
        padding: "10px 15px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginLeft: "10px",
    },
};

export default Chat;
