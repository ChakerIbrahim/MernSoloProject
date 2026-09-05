require("dotenv").config();

const Package = require("./models/package.model");
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

require("./config/mongoose.config");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(cookieParser());

// Create the uploads folder automatically if it doesn't exist yet — this
// means a fresh git clone on a new machine works immediately, with no
// manual folder setup needed
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}
// Serves everything in /uploads at http://localhost:8000/uploads/<filename>,
// so an uploaded photo's path (saved in the database) becomes a real,
// loadable image URL in the browser
app.use("/uploads", express.static(uploadsPath));

const PORT = process.env.PORT;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
app.set("io", io);

require("./routes/user.routes")(app);
require("./routes/package.routes")(app);
require("./routes/inquiry.routes")(app);
require("./routes/ai.routes")(app);
require("./routes/review.routes")(app);

const Message = require("./models/message.model");

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("join_inquiry", (inquiryId) => {
    socket.join(inquiryId);
  });

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