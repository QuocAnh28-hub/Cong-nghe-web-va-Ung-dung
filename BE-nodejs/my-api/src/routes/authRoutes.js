const express = require("express");
const router = express.Router();

const { login, register } = require("../controllers/authController");

router.post("/", login);
router.post("/register", register);

module.exports = router;
