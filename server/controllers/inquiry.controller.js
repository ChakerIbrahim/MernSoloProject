// Import the Inquiry model — this is what talks to the inquiries collection
const Inquiry = require("../models/inquiry.model");

// Handles POST /api/inquiries — a traveler reaches out to an agency about a package
const createInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.create(req.body);
    return res.json({ inquiry });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Handles GET /api/inquiries — supports filtering by traveler OR agency,
// since both sides need to see "their" inquiries but from opposite angles
const getInquiries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.traveler) filter.traveler = req.query.traveler;
    if (req.query.agency) filter.agency = req.query.agency;

    const inquiries = await Inquiry.find(filter)
      .populate("traveler", "firstName")
      .populate("agency", "firstName agencyName")
      .populate("package", "title destination");

    return res.json({ inquiries });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Handles GET /api/inquiries/:id — one specific inquiry thread, with enough
// detail on each side (traveler, agency, package) to build a chat screen around
const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate("traveler", "firstName")
      .populate("agency", "firstName agencyName")
      .populate("package", "title destination price");

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    return res.json({ inquiry });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Handles PUT /api/inquiries/:id — the agency confirms or declines a request
const updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true },
    );

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    return res.json({ inquiry });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
};