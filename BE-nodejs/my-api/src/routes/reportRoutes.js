const express = require("express");
const router = express.Router();

const {
  getRoomOccupancyByMonth,
  getNetRevenueByMonth,
  getGuestTypeByMonth,
  getReservationCountByMonth,
  getRevenueByDayInMonth,
  getRevenueByRoomTypeInMonth,
  getRoomTypeUsagePercentInMonth,
  getRevenueByCustomerType,
} = require("../controllers/reportController");

router.get("/room-occupancy-by-month", getRoomOccupancyByMonth);
router.get("/net-revenue-by-month", getNetRevenueByMonth);
router.get("/guest-type-by-month", getGuestTypeByMonth);
router.get("/reservation-count-by-month", getReservationCountByMonth);
router.get("/revenue-by-day-in-month", getRevenueByDayInMonth);
router.get("/revenue-by-room-type-in-month", getRevenueByRoomTypeInMonth);
router.get("/room-type-usage-percent-in-month", getRoomTypeUsagePercentInMonth);
router.get("/revenue-by-customer-type", getRevenueByCustomerType);

module.exports = router;
