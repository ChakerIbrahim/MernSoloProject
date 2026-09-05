const Package = require("../models/package.model");

// Handles POST /api/packages — an agency creates a new package listing.
// verifyToken already ran, so req.user.id is the real, verified agency —
// we ignore whatever "agency" value the client might have sent in the form
const createPackage = async (req, res) => {
  try {
    const includes = req.body.includes ? JSON.parse(req.body.includes) : [];
    const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    const images = req.file ? [`/uploads/${req.file.filename}`] : [];

    const pkg = await Package.create({
      ...req.body,
      agency: req.user.id,
      includes,
      tags,
      images,
    });
    return res.json({ package: pkg });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getPackages = async (req, res) => {
  try {
    const filter = {};

    if (req.query.destination) {
      filter.destination = { $regex: req.query.destination, $options: "i" };
    }

    if (req.query.maxPrice) {
      filter.price = { $lte: Number(req.query.maxPrice) };
    }

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

// Handles PUT /api/packages/:id — an agency edits one of THEIR OWN packages
const updatePackage = async (req, res) => {
  try {
    // Look the package up first, before changing anything, so we can
    // check who actually owns it
    const existingPackage = await Package.findById(req.params.id);

    if (!existingPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    // existingPackage.agency is an ObjectId, req.user.id is a plain string —
    // .toString() puts them in the same format so === actually works
    if (existingPackage.agency.toString() !== req.user.id) {
      return res.status(403).json({ message: "You don't own this package" });
    }

    const updateData = { ...req.body };

    if (req.body.includes !== undefined) {
      updateData.includes = JSON.parse(req.body.includes);
    }
    if (req.body.tags !== undefined) {
      updateData.tags = JSON.parse(req.body.tags);
    }
    if (req.file) {
      updateData.images = [`/uploads/${req.file.filename}`];
    }

    const pkg = await Package.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.json({ package: pkg });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Handles DELETE /api/packages/:id — same ownership check as update
const deletePackage = async (req, res) => {
  try {
    const existingPackage = await Package.findById(req.params.id);

    if (!existingPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    if (existingPackage.agency.toString() !== req.user.id) {
      return res.status(403).json({ message: "You don't own this package" });
    }

    await Package.findByIdAndDelete(req.params.id);
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