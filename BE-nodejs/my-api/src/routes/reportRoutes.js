const express = require("express");
const router = express.Router();

const {
  getRoomOccupancyByMonth,
  getNetRevenueByMonth,
  getGuestTypeByMonth,
  getReservationCountByMonth,
} = require("../controllers/reportController");

router.get("/room-occupancy-by-month", getRoomOccupancyByMonth);
router.get("/net-revenue-by-month", getNetRevenueByMonth);
router.get("/guest-type-by-month", getGuestTypeByMonth);
router.get("/reservation-count-by-month", getReservationCountByMonth);

module.exports = router;
