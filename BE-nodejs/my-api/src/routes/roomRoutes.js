const express = require("express");
const router = express.Router();

const {
  getRooms,
  getRoomCalendar,
  getAvailableRoomsAdvanced,
  addRoom,
  updateRoom,
} = require("../controllers/roomController");

router.get("/calendar", getRoomCalendar);
router.get("/available", getAvailableRoomsAdvanced);
router.get("/", getRooms);
router.post("/", addRoom);
router.put("/:id", updateRoom);

module.exports = router;