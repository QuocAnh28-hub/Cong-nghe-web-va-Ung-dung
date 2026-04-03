const express = require("express");
const router = express.Router();

const { getRooms, addRoom, updateRoom } = require("../controllers/roomController");

router.get("/", getRooms);
router.post("/", addRoom);
router.put("/:id", updateRoom);

module.exports = router;
