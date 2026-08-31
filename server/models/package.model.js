// Import mongoose so we can define a schema and create a model from it
const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema(
  {
    // The agency that created this package. We store a reference to their
    // User document (their unique _id) instead of copying their info here —
    // "ref: User" tells Mongoose which collection this ID points to
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Agency is required"],
    },

    title: {
      type: String,
      required: [true, "Title is required"],
    },

    destination: {
      type: String,
      required: [true, "Destination is required"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
    },

    durationDays: {
      type: Number,
      required: [true, "Duration is required"],
    },

    // A list of what's included, e.g. ["Flights", "Hotel", "Breakfast"].
    // Defaults to an empty array so a new package never has "undefined" here
    includes: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
    },

    images: {
      type: [String],
      default: [],
    },

    // How many bookings are still available — this is what Socket.IO will
    // update live later when someone requests to book
    spotsAvailable: {
      type: Number,
      default: 10,
    },

    // Used for search/filtering, e.g. ["beach", "family", "budget"]
    tags: {
      type: [String],
      default: [],
    },
  },
  // Adds createdAt and updatedAt automatically
  { timestamps: true },
);

// Turn the schema into an actual Model we can use to create/find/update packages
const Package = mongoose.model("Package", PackageSchema);

module.exports = Package;