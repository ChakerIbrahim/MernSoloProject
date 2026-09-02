// Import the controller functions we just wrote, so we can attach them to real URLs
const UserController = require("../controllers/user.controller");
const verifyToken = require("../middleware/verifyToken");

// This file exports a function that takes the Express app and registers routes on it
module.exports = (app) => {
  app.post("/api/register", UserController.registerUser);
  app.post("/api/login", UserController.loginUser);
  app.get("/api/users", UserController.getUsers);
  // ...inside the existing module.exports = (app) => { ... } block, add:
  app.get("/api/me", verifyToken, UserController.getCurrentUser);
  app.post("/api/logout", UserController.logoutUser);
};