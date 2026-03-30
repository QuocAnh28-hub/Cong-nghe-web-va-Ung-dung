const express = require("express");
const cors = require("cors");

const roomTypeRoutes = require("./routes/roomTypeRoutes");
const authRoutes = require("./routes/authRoutes");
const receptionistRoutes = require("./routes/receptionistRoutes");
const roomRoutes = require("./routes/roomRoutes");
const rateRoutes = require("./routes/rateRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/room-types", roomTypeRoutes);
app.use("/api/login", authRoutes);
app.use("/api/receptionists", receptionistRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/rates", rateRoutes);

module.exports = app;