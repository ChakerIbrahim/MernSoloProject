import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Box, TextField, Button, Typography } from "@mui/material";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";

function InquiryChat() {
  const { id } = useParams();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Persists across re-renders without causing one itself — used purely to
  // grab a real DOM element to scroll to, not to store data we display
  const bottomRef = useRef(null);

  // Loads existing message history once, when the page first opens
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

  // Handles the real-time side: joining the room, and listening for new messages
  useEffect(() => {
    socket.emit("join_inquiry", id);

    const handleReceive = (message) => {
      // Only add it if it belongs to this conversation — a safety check,
      // since in theory a stray event could arrive after navigating away
      if (message.inquiry === id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handleReceive);

    // Cleanup: remove this specific listener when leaving the page, so
    // opening a different conversation later doesn't stack duplicate ones
    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [id]);

  // Runs after every render where "messages" changed, scrolling the newest
  // message into view automatically
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
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Conversation
        </Typography>

        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            height: 400,
            overflowY: "auto",
            p: 2,
            mb: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {messages.map((message) => {
            const isMine = message.sender._id === user._id;

            return (
              <Box
                key={message._id}
                sx={{
                  alignSelf: isMine ? "flex-end" : "flex-start",
                  bgcolor: isMine ? "primary.main" : "grey.200",
                  color: isMine ? "primary.contrastText" : "text.primary",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  maxWidth: "75%",
                }}
              >
                <Typography variant="caption" sx={{ display: "block", opacity: 0.7 }}>
                  {message.sender.firstName}
                </Typography>
                <Typography variant="body2">{message.text}</Typography>
              </Box>
            );
          })}

          {/* An empty, invisible element purely to scroll to */}
          <div ref={bottomRef} />
        </Box>

        <Box component="form" onSubmit={handleSend} sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" variant="contained">
            Send
          </Button>
        </Box>
      </Container>
    </>
  );
}

export default InquiryChat;