const Package = require("../models/package.model");

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
    const filter = {};

    if (req.query.destination) {
      filter.destination = { $regex: req.query.destination, $options: "i" };
    }

    if (req.query.maxPrice) {
      filter.price = { $lte: Number(req.query.maxPrice) };
    }

    // NEW: lets the agency dashboard ask for "just my packages" by
    // passing ?agency=<their own user id>
    if (req.query.agency) {
      filter.agency = req.query.agency;
    }

    const packages = await Package.find(filter).populate(
      "agency",
      "firstName agencyName",
    );

    return res.json({ packages });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

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