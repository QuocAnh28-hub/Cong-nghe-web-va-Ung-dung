const express = require("express");
const router = express.Router();

const { getRates, addRate, updateRate, deleteRate } = require("../controllers/rateController");

router.get("/", getRates);
router.post("/", addRate);
router.put("/:id", updateRate);
router.delete("/:id", deleteRate);

module.exports = router;
