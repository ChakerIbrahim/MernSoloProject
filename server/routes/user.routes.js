// Import the controller functions we just wrote, so we can attach them to real URLs
const UserController = require("../controllers/user.controller");

// This file exports a function that takes the Express app and registers routes on it
module.exports = (app) => {
  app.post("/api/register", UserController.registerUser);
  app.post("/api/login", UserController.loginUser);
  app.get("/api/users", UserController.getUsers);
};