import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setChatHistory((prev) => [...prev, { role: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/ai/chat", { message: userMessage });
      setChatHistory((prev) => [...prev, { role: "ai", text: response.data.reply }]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: err.response?.data?.message || "Something went wrong" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4">📚 Library Assistant</h2>

      <div
        className="border rounded p-3 mb-3"
        style={{ height: "400px", overflowY: "auto", backgroundColor: "#f8f9fa" }}
      >
        {chatHistory.length === 0 && (
          <p className="text-muted">Ask me anything about books in the library!</p>
        )}

        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`mb-2 d-flex ${chat.role === "user" ? "justify-content-end" : "justify-content-start"}`}
          >
            <div
              className={`p-2 rounded ${
                chat.role === "user" ? "bg-primary text-white" : "bg-white border"
              }`}
              style={{ maxWidth: "80%" }}
            >
              {chat.text}
            </div>
          </div>
        ))}

        {loading && <p className="text-muted">AI is typing...</p>}
      </div>

      <form onSubmit={handleSend} className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Ask about books..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chatbot;