const Inquiry = require("../models/inquiry.model");

// Handles POST /api/inquiries — a traveler reaches out to an agency about a package
const createInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.create(req.body);

    // Populate enough detail for the agency dashboard to display this
    // inquiry immediately off the socket event, without a second fetch
    await inquiry.populate("traveler", "firstName");
    await inquiry.populate("package", "title destination");

    // Grab the io instance we attached to the app in server.js, and emit
    // only to the room named after this inquiry's agency ID — so only
    // that one agency's dashboard (if they're currently connected) sees it
    const io = req.app.get("io");
    io.to(inquiry.agency.toString()).emit("new_inquiry", inquiry);

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
    if (req.query.package) filter.package = req.query.package;

    const inquiries = await Inquiry.find(filter)
      .populate("traveler", "firstName")
      .populate("agency", "firstName agencyName")
      .populate("package", "title destination");

    return res.json({ inquiries });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

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

// Handles PUT /api/inquiries/:id — the agency confirms or declines a
// request. Protected by verifyToken, and now also checks that the
// logged-in user is actually THIS inquiry's agency — same ownership
// pattern as packages, and same reason: without this, anyone could hit
// this route directly and flip any inquiry's status
const updateInquiryStatus = async (req, res) => {
  try {
    const existingInquiry = await Inquiry.findById(req.params.id);

    if (!existingInquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    if (existingInquiry.agency.toString() !== req.user.id) {
      return res.status(403).json({ message: "You don't own this inquiry" });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true },
    );

    return res.json({ inquiry });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const Message = require("../models/message.model");

const getMessagesForInquiry = async (req, res) => {
  try {
    const messages = await Message.find({ inquiry: req.params.id })
      .populate("sender", "firstName")
      .sort({ createdAt: 1 });

    return res.json({ messages });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  getMessagesForInquiry,
};