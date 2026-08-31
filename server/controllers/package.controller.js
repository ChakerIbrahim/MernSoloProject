// Import the Package model — this is what talks to the packages collection in MongoDB
const Package = require("../models/package.model");

// Handles POST /api/packages — an agency creates a new package listing
const createPackage = async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    return res.json({ package: pkg });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Handles GET /api/packages — public browsing/search, with optional filters
const getPackages = async (req, res) => {
  try {
    // Start with an empty filter — an empty object matches everything in MongoDB
    const filter = {};

    // Only add a destination filter if the frontend actually sent one
    if (req.query.destination) {
      filter.destination = { $regex: req.query.destination, $options: "i" };
    }

    if (req.query.maxPrice) {
      filter.price = { $lte: Number(req.query.maxPrice) };
    }

    // .find(filter) returns everything matching; populate swaps in agency name/info
    const packages = await Package.find(filter).populate(
      "agency",
      "firstName agencyName",
    );

    return res.json({ packages });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Handles GET /api/packages/:id — a single package's full detail page
const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id).populate(
      "agency",
      "firstName agencyName agencyDescription",
    );

    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    return res.json({ package: pkg });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Handles PUT /api/packages/:id — an agency edits one of their packages
const updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    return res.json({ package: pkg });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Handles DELETE /api/packages/:id — removes a package entirely
const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);

    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    return res.json({ message: "Package deleted" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
};