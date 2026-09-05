const ReviewController = require("../controllers/review.controller");
const verifyToken = require("../middleware/verifyToken");

module.exports = (app) => {
  app.post("/api/reviews", verifyToken, ReviewController.createReview);
  app.get("/api/reviews", ReviewController.getReviews);
};