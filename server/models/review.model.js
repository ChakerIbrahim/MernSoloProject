const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
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
    // Optional — a review can exist without pointing at a specific package
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
    // Bounded 1-5, each boundary with its own message if violated
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      required: [true, "Rating is required"],
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true },
);

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;