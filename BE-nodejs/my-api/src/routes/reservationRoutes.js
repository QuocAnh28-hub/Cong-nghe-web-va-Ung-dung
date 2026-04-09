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
  checkOutRoom,
  addServiceUsage,
  updateServiceUsage,
  deleteServiceUsage,
  getServiceUsageByStay,
  addMinibarUsage,
  updateMinibarUsage,
  deleteMinibarUsage,
  getMinibarUsageByStay,
  getMinibarByRoom,
  addPenalty,
  updatePenalty,
  deletePenalty,
  getPenaltyByStay,
  getRoomStayHistoryCheckedOutByStay,
} = require("../controllers/reservationController");

router.get("/waiting-checkin-customers", getWaitingCheckInCustomers);
router.get("/current-staying-customers", getCurrentStayingCustomers);
router.get("/:reservationId/available-rooms-for-checkin", getAvailableRoomsForCheckIn);
router.post("/checkin/by-reservation", checkInByReservationOneRoom);
router.post("/checkin/walkin", checkInWalkInOneRoom);
router.post("/transfer-room", transferRoom);
router.patch("/stays/:stayId/extend", extendStay);
router.post("/checkout-room", checkOutRoom);
router.get("/stays/:stayId/service-usages", getServiceUsageByStay);
router.post("/stays/:stayId/service-usages", addServiceUsage);
router.put("/service-usages/:usageId", updateServiceUsage);
router.delete("/service-usages/:usageId", deleteServiceUsage);
router.get("/stays/:stayId/minibar-usages", getMinibarUsageByStay);
router.post("/stays/:stayId/minibar-usages", addMinibarUsage);
router.put("/minibar-usages/:id", updateMinibarUsage);
router.delete("/minibar-usages/:id", deleteMinibarUsage);
router.get("/rooms/:roomId/minibar-items", getMinibarByRoom);
router.get("/stays/:stayId/penalties", getPenaltyByStay);
router.get("/stays/:stayId/room-stay-history-checkedout", getRoomStayHistoryCheckedOutByStay);
router.post("/stays/:stayId/penalties", addPenalty);
router.put("/penalties/:penaltyId", updatePenalty);
router.delete("/penalties/:penaltyId", deletePenalty);
router.get("/", getAllReservations);
router.get("/user/:userId/history", getReservationHistoryByUser);
router.post("/", createReservation);
router.post("/new-customer", createReservationWithNewCustomer);
router.put("/:id", updateReservation);
router.patch("/:id/cancel", cancelReservation);

module.exports = router;