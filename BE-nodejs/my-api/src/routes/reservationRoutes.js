const express = require("express");
const router = express.Router();

const {
  createReservation,
  createReservationWithNewCustomer,
  getReservationHistoryByUser,
  getAllReservations,
  updateReservation,
  cancelReservation,
  getWaitingCheckInCustomers,
  getCurrentStayingCustomers,
  getAvailableRoomsForCheckIn,
  checkInByReservationOneRoom,
  checkInWalkInOneRoom,
  transferRoom,
  extendStay,
} = require("../controllers/reservationController");

router.get("/waiting-checkin-customers", getWaitingCheckInCustomers);
router.get("/current-staying-customers", getCurrentStayingCustomers);
router.get(
  "/:reservationId/available-rooms-for-checkin",
  getAvailableRoomsForCheckIn,
);
router.post("/checkin/by-reservation", checkInByReservationOneRoom);
router.post("/checkin/walkin", checkInWalkInOneRoom);
router.post("/transfer-room", transferRoom);
router.patch("/stays/:stayId/extend", extendStay);
router.get("/", getAllReservations);
router.get("/user/:userId/history", getReservationHistoryByUser);
router.post("/", createReservation);
router.post("/new-customer", createReservationWithNewCustomer);
router.put("/:id", updateReservation);
router.patch("/:id/cancel", cancelReservation);

module.exports = router;