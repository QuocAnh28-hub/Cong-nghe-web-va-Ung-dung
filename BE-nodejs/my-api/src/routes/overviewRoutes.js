const express = require("express");
const router = express.Router();

const {
  getRoomStatistics,
  getOccupancyRate,
  getRoomStatusSummary,
  getCustomerSummary,
} = require("../controllers/overviewController");

router.get("/room-statistics", getRoomStatistics);
router.get("/occupancy-rate", getOccupancyRate);
router.get("/room-status-summary", getRoomStatusSummary);
router.get("/customer-summary", getCustomerSummary);

module.exports = router;
