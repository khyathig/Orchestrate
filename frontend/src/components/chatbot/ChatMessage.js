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
