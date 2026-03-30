const express = require("express");
const router = express.Router();

const { getRates } = require("../controllers/rateController");

router.get("/", getRates);

module.exports = router;
