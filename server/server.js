// Load environment variables (PORT, MONGOOSE_URI) from .env into process.env
require("dotenv").config();

// Express: the framework we use to build the API and handle HTTP requests
const express = require("express");

// CORS: lets our React app (running on a different port) make requests to this server
const cors = require("cors");

// Requiring this file runs the connection logic inside it immediately
require("./config/mongoose.config");

// Create the Express application
const app = express();

// Parses incoming JSON in request bodies (e.g. data sent from a React form) into req.body
app.use(express.json());

// Parses incoming URL-encoded form data into req.body
app.use(express.urlencoded({ extended: true }));

// Allows requests from the React app's dev server, and allows cookies to be sent (needed for JWT auth later)
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

// The port to listen on, read from .env
const PORT = process.env.PORT;

// Routes will be added here in the next piece — nothing to register yet

// Start the server
app.listen(PORT, () => {
  console.log("server is running");
});