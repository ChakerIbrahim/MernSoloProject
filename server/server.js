// Load environment variables (PORT, MONGOOSE_URI, SECRET) from .env into process.env
require("dotenv").config();

const cookieParser = require("cookie-parser");

// Express: the framework we use to build the API and handle HTTP requests
const express = require("express");

// CORS: lets our React app (running on a different port) make requests to this server
const cors = require("cors");

// http: Node's built-in module for creating a raw server. Socket.IO needs to
// attach to this directly — Express alone can't handle real-time connections
const http = require("http");

// Server: the actual Socket.IO class we use to add real-time functionality
const { Server } = require("socket.io");

// Requiring this file runs the connection logic inside it immediately
require("./config/mongoose.config");

// Create the Express application
const app = express();

// Parses incoming JSON in request bodies into req.body
app.use(express.json());

// Parses incoming URL-encoded form data into req.body
app.use(express.urlencoded({ extended: true }));

// Allows requests from the React app's dev server, and allows cookies to be sent
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

app.use(cookieParser());

// The port to listen on, read from .env
const PORT = process.env.PORT;

// Load the user routes, registering /api/register, /api/login, and /api/users
require("./routes/user.routes")(app);

// Load the package routes, registering full CRUD + search on /api/packages
require("./routes/package.routes")(app);

require("./routes/inquiry.routes")(app);

// Wrap the Express app in a plain HTTP server. Express normally does this
// invisibly when we call app.listen() directly, but Socket.IO needs access
// to that raw server object itself, so we create it explicitly here
const server = http.createServer(app);

// Attach Socket.IO to the raw server, with the same CORS rule as our regular
// API — otherwise the browser would block the real-time connection too
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Fires once, automatically, every time a browser successfully connects.
// "socket" here represents that one specific connected client
// Import the Message model so we can save chat messages to the database
const Message = require("./models/message.model");

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  // The frontend calls this once, right when someone opens a specific
  // conversation, telling this socket to join that inquiry's private room
  socket.on("join_inquiry", (inquiryId) => {
    socket.join(inquiryId);
  });

  // Fired when either side sends a message. "data" is an object containing
  // everything the Message schema needs: inquiry, sender, text
  socket.on("send_message", async (data) => {
    try {
      const message = await Message.create(data);

      // Populate the sender's name before sending it back out, so the
      // frontend can display "Sara: hey!" without a separate lookup
      const populatedMessage = await message.populate("sender", "firstName");

      // io.to(room).emit(...) sends only to sockets that joined this
      // specific room — not every connected client like io.emit() would
      io.to(data.inquiry).emit("receive_message", populatedMessage);
    } catch (error) {
      console.log("error saving message:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected:", socket.id);
  });
});

// Start the server — note this is server.listen now, not app.listen, since
// "server" is the object that actually understands both HTTP and Socket.IO
server.listen(PORT, () => {
  console.log("server is running");
});