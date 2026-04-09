const express = require("express");
const router = express.Router();

const {
  getPendingInvoices,
  getInvoiceHistory,
  createAndPayInvoice,
} = require("../controllers/invoiceController");

router.get("/pending", getPendingInvoices);
router.get("/history", getInvoiceHistory);
router.post("/create-and-pay", createAndPayInvoice);

module.exports = router;