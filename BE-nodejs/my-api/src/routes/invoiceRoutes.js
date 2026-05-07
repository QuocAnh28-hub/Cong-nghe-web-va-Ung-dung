const express = require("express");
const router = express.Router();

const {
  getPendingInvoices,
  getInvoiceHistory,
  getFullInvoiceByStayID,
  createAndPayInvoice,
} = require("../controllers/invoiceController");

router.get("/pending", getPendingInvoices);
router.get("/history", getInvoiceHistory);
router.get("/full/:stayId", getFullInvoiceByStayID);
router.post("/create-and-pay", createAndPayInvoice);

module.exports = router;