const express = require("express");
const router = express.Router();

const { getReceptionists } = require("../controllers/receptionistController");

router.get("/", getReceptionists);

module.exports = router;
