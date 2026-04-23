const express = require("express");
const router = express.Router();

const { getRoomTypesWithCurrentRate, updateUserCustomerInfo, changePassword } = require("../controllers/pagesForCustomerController");

router.get("/", getRoomTypesWithCurrentRate);
router.put("/user/:userId", updateUserCustomerInfo);
router.put("/user/:userId/password", changePassword);

module.exports = router;
