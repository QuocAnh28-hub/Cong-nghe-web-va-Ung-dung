const express = require("express");
const router = express.Router();

const { getReceptionists, createReceptionist, updateReceptionist, deleteReceptionist } = require("../controllers/receptionistController");

router.get("/", getReceptionists);
router.post("/", createReceptionist);
router.put("/", updateReceptionist);
router.delete("/", deleteReceptionist);

module.exports = router;
