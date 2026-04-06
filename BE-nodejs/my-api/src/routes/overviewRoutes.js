const express = require("express");
const router = express.Router();

const {
  getRoomStatistics,
  getOccupancyRate,
  getRoomStatusSummary,
  getCustomerSummary,
  getTodayCheckInReservationCheckOutStay,
  getRevenueThisMonthWithStayCount,
} = require("../controllers/overviewController");

router.get("/room-statistics", getRoomStatistics);
router.get("/occupancy-rate", getOccupancyRate);
router.get("/room-status-summary", getRoomStatusSummary);
router.get("/customer-summary", getCustomerSummary);
router.get("/today-checkin-checkout", getTodayCheckInReservationCheckOutStay);
router.get("/revenue-this-month", getRevenueThisMonthWithStayCount);

module.exports = router;
