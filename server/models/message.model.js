const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    inquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inquiry",
      required: [true, "Inquiry is required"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
    },
    // true/false field, tracked so unread-message badges (Socket.IO piece) can work
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;