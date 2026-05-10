const express = require("express");
const router = express.Router();

const {
  getRoomTypesWithCurrentRate,
  searchAvailableRoomTypes,
  updateUserCustomerInfo,
  changePassword,
} = require("../controllers/pagesForCustomerController");

router.get("/", getRoomTypesWithCurrentRate);
router.get("/available-room-types", searchAvailableRoomTypes);
router.put("/user/:userId", updateUserCustomerInfo);
router.put("/user/:userId/password", changePassword);

module.exports = router;
