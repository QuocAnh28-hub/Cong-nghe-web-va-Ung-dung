const express = require("express");
const router = express.Router();

const { getRooms,getRoomCalendar, addRoom, updateRoom } = require("../controllers/roomController");

router.get("/", getRooms);
router.get("/calendar", getRoomCalendar);
router.post("/", addRoom);
router.put("/:id", updateRoom);

module.exports = router;
