import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";

function InquiryChat() {
  const { id } = useParams();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/inquiries/${id}/messages`,
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.log("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [id]);

  useEffect(() => {
    socket.emit("join_inquiry", id);

    const handleReceive = (message) => {
      if (message.inquiry === id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    socket.emit("send_message", {
      inquiry: id,
      sender: user._id,
      text: text,
    });

    setText("");
  };

  return (
    <>
      <Header />
      <div className="mx-auto max-w-xl px-6 py-8">
        <h1 className="mb-4 text-2xl font-bold text-ink">Conversation</h1>

        <div className="mb-4 flex h-[400px] flex-col gap-2 overflow-y-auto rounded-lg border border-line bg-white p-4">
          {messages.map((message) => {
            const isMine = message.sender._id === user._id;

            return (
              <div
                key={message._id}
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMine ? "self-end bg-ocean-dark text-white" : "self-start bg-line/60 text-ink"
                }`}
              >
                <p className={`text-xs ${isMine ? "text-white/70" : "text-ink/60"}`}>
                  {message.sender.firstName}
                </p>
                <p className="text-sm">{message.text}</p>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-md border border-line bg-white px-4 py-2.5 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ocean"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-md bg-ocean-dark px-5 py-2.5 font-semibold text-white hover:bg-ocean"
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}

export default InquiryChat;