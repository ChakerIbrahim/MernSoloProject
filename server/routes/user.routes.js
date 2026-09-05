const UserController = require("../controllers/user.controller");
const verifyToken = require("../middleware/verifyToken");

module.exports = (app) => {
  app.post("/api/register", UserController.registerUser);
  app.post("/api/login", UserController.loginUser);
  app.get("/api/users", UserController.getUsers);
  app.get("/api/me", verifyToken, UserController.getCurrentUser);
  app.post("/api/logout", UserController.logoutUser);
  // NEW: public, no verifyToken — anyone should be able to view an agency's profile
  app.get("/api/agencies/:id", UserController.getAgencyById);
};