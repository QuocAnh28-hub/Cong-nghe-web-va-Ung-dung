const express = require("express");
const router = express.Router();

const { getRoomTypesWithCurrentRate } = require("../controllers/pagesForCustomerController");

router.get("/", getRoomTypesWithCurrentRate);

module.exports = router;
