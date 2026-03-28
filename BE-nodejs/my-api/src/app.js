const express = require("express");
const cors = require("cors");

const roomTypeRoutes = require("./routes/roomTypeRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/room-types", roomTypeRoutes);
app.use("/api/login", authRoutes);

module.exports = app;