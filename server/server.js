require("dotenv").config();

const Package = require("./models/package.model");
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("./config/mongoose.config");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(cookieParser());

const PORT = process.env.PORT;

// Wrap the Express app in a plain HTTP server, and attach Socket.IO to it.
// This is moved up here, BEFORE the routes are required below, so that
// app.set("io", io) runs first. That's what lets any controller — like
// inquiry.controller.js — reach this same "io" object later via
// req.app.get("io"), even though the controller lives in a totally
// separate file with no direct import of server.js
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
app.set("io", io);

// Load the user routes, registering /api/register, /api/login, and /api/users
require("./routes/user.routes")(app);

// Load the package routes, registering full CRUD + search on /api/packages
require("./routes/package.routes")(app);

require("./routes/inquiry.routes")(app);

require("./routes/ai.routes")(app);

// Import the Message model so we can save chat messages to the database
const Message = require("./models/message.model");

// Fires once, automatically, every time a browser successfully connects.
// "socket" here represents that one specific connected client
io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("join_inquiry", (inquiryId) => {
    socket.join(inquiryId);
  });

  // NEW: the agency dashboard calls this once, right after connecting, so
  // this socket joins a private room named after that agency's own user
  // ID. That's how we can later send a notification to ONLY that agency
  // instead of broadcasting it to every connected client
  socket.on("join_agency", (agencyId) => {
    socket.join(agencyId);
  });

  socket.on("send_message", async (data) => {
    try {
      const message = await Message.create(data);
      const populatedMessage = await message.populate("sender", "firstName");
      io.to(data.inquiry).emit("receive_message", populatedMessage);
    } catch (error) {
      console.log("error saving message:", error.message);
    }
  });

  socket.on("book_request", async (packageId) => {
    try {
      const pkg = await Package.findOneAndUpdate(
        { _id: packageId, spotsAvailable: { $gt: 0 } },
        { $inc: { spotsAvailable: -1 } },
        { new: true },
      );

      if (pkg) {
        io.emit("spots_updated", {
          packageId: pkg._id.toString(),
          spotsAvailable: pkg.spotsAvailable,
        });
      } else {
        socket.emit("book_failed", { message: "No spots available for this package" });
      }
    } catch (error) {
      console.log("error updating spots:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log("server is running");
});