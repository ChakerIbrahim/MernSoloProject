const PackageController = require("../controllers/package.controller");

module.exports = (app) => {
  app.post("/api/packages", PackageController.createPackage);
  app.get("/api/packages", PackageController.getPackages);
  app.get("/api/packages/:id", PackageController.getPackageById);
  app.put("/api/packages/:id", PackageController.updatePackage);
  app.delete("/api/packages/:id", PackageController.deletePackage);
};