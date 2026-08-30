// Load environment variables again — needed because this file can run on its own
require("dotenv").config();

// Mongoose lets us connect to MongoDB and define schemas/models
const mongoose = require("mongoose");

// The database connection string, read from .env (never hardcoded, never pushed to GitHub)
const uri = process.env.MONGOOSE_URI;

// Try to connect to the database as soon as this file is required
mongoose
  .connect(uri)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log("error connecting to db", err.message);
  });