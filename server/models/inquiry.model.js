const mongoose = require("mongoose");

const InquirySchema = new mongoose.Schema(
  {
    traveler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Traveler is required"],
    },
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Agency is required"],
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: [true, "Package is required"],
    },
    // Restricted to exactly these three values — nothing else can be saved here
    status: {
      type: String,
      enum: ["pending", "confirmed", "declined"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Inquiry = mongoose.model("Inquiry", InquirySchema);

module.exports = Inquiry;