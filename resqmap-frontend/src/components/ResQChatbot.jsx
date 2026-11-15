import "./ResQChatbot.css";
import React, { useState } from "react";
import api from "../services/api";

export default function ResQChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      answer:
        "Hello! I'm ResQ AI. I can help with disaster preparedness and safety guidance. What would you like to know?",
      sources: [],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", answer: trimmedQuestion, sources: [] },
    ]);

    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/ai/chat/", {
        question: trimmedQuestion,
      });

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          answer: response.data.answer,
          sources: response.data.sources || [],
        },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to connect to ResQ AI. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="resq-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open ResQ AI chatbot"
      >
        {isOpen ? "×" : "🤖"}
      </button>

      {isOpen && (
        <div className="resq-chat-window">
          <div className="resq-chat-header">
            <div>
              <h3>ResQ AI</h3>
              <span>Disaster Safety Assistant</span>
            </div>

            <button
              className="resq-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>

          <div className="resq-chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`resq-message ${
                  message.role === "user" ? "user-message" : "ai-message"
                }`}
              >
                <div className="resq-message-label">
                  {message.role === "user" ? "You" : "ResQ AI"}
                </div>

                <div className="resq-message-content">
                  {message.answer}
                </div>

                {message.sources.length > 0 && (
                  <div className="resq-sources">
                    <strong>Sources</strong>
                    {message.sources.map((source, sourceIndex) => (
                      <div key={sourceIndex}>
                        {source.document}, page {source.page}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="resq-message ai-message">
                ResQ AI is thinking...
              </div>
            )}

            {error && <div className="resq-chat-error">{error}</div>}
          </div>

          <form className="resq-chat-input" onSubmit={sendMessage}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about disaster safety..."
              disabled={loading}
            />

            <button type="submit" disabled={loading || !question.trim()}>
              Send
            </button>
          </form>

          <div className="resq-chat-disclaimer">
            AI-generated guidance. Not a substitute for emergency services.
          </div>
        </div>
      )}
    </>
  );
}
