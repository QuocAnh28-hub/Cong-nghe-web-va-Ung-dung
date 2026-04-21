const express = require("express");
const router = express.Router();

const { getRoomTypesWithCurrentRate, updateUserCustomerInfo } = require("../controllers/pagesForCustomerController");

router.get("/", getRoomTypesWithCurrentRate);
router.put("/user/:userId", updateUserCustomerInfo);

module.exports = router;
