const Review = require("../models/review.model");
const Inquiry = require("../models/inquiry.model");
const User = require("../models/user.model");

// Handles POST /api/reviews — a traveler reviews an agency they've actually
// had a confirmed booking with. Protected by verifyToken.
const createReview = async (req, res) => {
  try {
    // The JWT only carries { email, id }, no role — so we look the user up
    // to confirm they're really a traveler, same pattern getCurrentUser uses
    const currentUser = await User.findById(req.user.id);

    if (!currentUser || currentUser.role !== "traveler") {
      return res.status(403).json({ message: "Only travelers can leave reviews" });
    }

    // Require a CONFIRMED inquiry between this exact traveler and this exact
    // agency — otherwise anyone could post a review for an agency they've
    // never actually interacted with
    const confirmedInquiry = await Inquiry.findOne({
      traveler: req.user.id,
      agency: req.body.agency,
      status: "confirmed",
    });

    if (!confirmedInquiry) {
      return res.status(403).json({
        message: "You can only review agencies you have a confirmed booking with",
      });
    }

    // Ignore whatever "traveler" value the client might send — use the
    // verified ID from the token, same pattern as packages
    const review = await Review.create({
      ...req.body,
      traveler: req.user.id,
    });

    return res.json({ review });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Handles GET /api/reviews — public, filterable by agency and/or package
const getReviews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.agency) filter.agency = req.query.agency;
    if (req.query.package) filter.package = req.query.package;

    const reviews = await Review.find(filter)
      .populate("traveler", "firstName")
      .populate("package", "title")
      .sort({ createdAt: -1 });

    return res.json({ reviews });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getReviews,
};