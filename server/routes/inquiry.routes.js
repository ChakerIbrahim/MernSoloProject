const InquiryController = require("../controllers/inquiry.controller");

module.exports = (app) => {
  app.post("/api/inquiries", InquiryController.createInquiry);
  app.get("/api/inquiries", InquiryController.getInquiries);
  app.get("/api/inquiries/:id", InquiryController.getInquiryById);
  app.put("/api/inquiries/:id", InquiryController.updateInquiryStatus);
  app.get("/api/inquiries/:id/messages", InquiryController.getMessagesForInquiry);
};