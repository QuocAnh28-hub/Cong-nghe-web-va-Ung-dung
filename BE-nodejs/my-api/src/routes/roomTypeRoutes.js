const express = require("express");
const router = express.Router();

const {
  getRoomTypes,
  addRoomType,
  updateRoomType,
  deleteRoomType,
} = require("../controllers/roomTypeController");

router.get("/", getRoomTypes);
router.post("/", addRoomType);
router.put("/:id", updateRoomType);
router.delete("/:id", deleteRoomType);

module.exports = router;