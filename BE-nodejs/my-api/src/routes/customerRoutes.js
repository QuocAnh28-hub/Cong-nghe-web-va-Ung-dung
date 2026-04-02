const express = require("express");
const router = express.Router();

const {
  getCustomersFullInfo,
  insertCustomer,
  updateCustomer,
} = require("../controllers/customerController");

router.get("/", getCustomersFullInfo);
router.post("/", insertCustomer);
router.put("/:id", updateCustomer);

module.exports = router;