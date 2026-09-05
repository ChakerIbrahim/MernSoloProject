const multer = require("multer");
const path = require("path");
const PackageController = require("../controllers/package.controller");
const verifyToken = require("../middleware/verifyToken");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

module.exports = (app) => {
  // verifyToken runs FIRST, before upload.single, before the controller —
  // so an unauthenticated request never even reaches multer or the database
  app.post(
    "/api/packages",
    verifyToken,
    upload.single("image"),
    PackageController.createPackage,
  );
  app.get("/api/packages", PackageController.getPackages);
  app.get("/api/packages/:id", PackageController.getPackageById);
  app.put(
    "/api/packages/:id",
    verifyToken,
    upload.single("image"),
    PackageController.updatePackage,
  );
  app.delete("/api/packages/:id", verifyToken, PackageController.deletePackage);
};