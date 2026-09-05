const AiController = require("../controllers/ai.controller");

module.exports = (app) => {
  app.post("/api/ai/search", AiController.aiSearch);
  app.post("/api/ai/translate", AiController.translateText);
};