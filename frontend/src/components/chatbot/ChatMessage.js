/**
 * ChatMessage Component
 *
 * This component renders an individual chat message, supporting markdown formatting.
 * It applies different styling based on whether the message is from the bot or the user.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {{ sender: string, text: string }} props.message - The chat message object.
 * @returns {JSX.Element} A formatted chat message component.
 */
import React from "react";
import ReactMarkdown from "react-markdown";

const ChatMessage = ({ message }) => {
  return (
    <div className={`message ${message.sender === "bot" ? "bot" : "user"}`}>
      <ReactMarkdown>{message.text}</ReactMarkdown>
    </div>
  );
};

export default ChatMessage;