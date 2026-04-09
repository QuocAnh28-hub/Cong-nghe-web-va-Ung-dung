const express = require("express");
const cors = require("cors");

const roomTypeRoutes = require("./routes/roomTypeRoutes");
const authRoutes = require("./routes/authRoutes");
const receptionistRoutes = require("./routes/receptionistRoutes");
const roomRoutes = require("./routes/roomRoutes");
const rateRoutes = require("./routes/rateRoutes");
const customerRoutes = require("./routes/customerRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const overviewRoutes = require("./routes/overviewRoutes");
const reportRoutes = require("./routes/reportRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/room-types", roomTypeRoutes);
app.use("/api/login", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/receptionists", receptionistRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/rates", rateRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/overview", overviewRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/invoice", invoiceRoutes);

module.exports = app;
