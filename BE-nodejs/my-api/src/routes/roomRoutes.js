const express = require("express");
const router = express.Router();

const { getRooms } = require("../controllers/roomController");

router.get("/", getRooms);

module.exports = router;
