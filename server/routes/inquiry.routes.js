const InquiryController = require("../controllers/inquiry.controller");
const verifyToken = require("../middleware/verifyToken");

module.exports = (app) => {
  app.post("/api/inquiries", InquiryController.createInquiry);
  app.get("/api/inquiries", InquiryController.getInquiries);
  app.get("/api/inquiries/:id", InquiryController.getInquiryById);
  app.put("/api/inquiries/:id", verifyToken, InquiryController.updateInquiryStatus);
  app.get("/api/inquiries/:id/messages", InquiryController.getMessagesForInquiry);
};