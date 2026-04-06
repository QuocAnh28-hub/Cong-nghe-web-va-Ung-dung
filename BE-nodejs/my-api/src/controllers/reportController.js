const { sql } = require("../config/db");

const parseYearMonth = (req, res) => {
  const year = Number.parseInt(req.query.year, 10);
  const month = Number.parseInt(req.query.month, 10);

  if (!Number.isInteger(year) || year < 1900 || year > 9999) {
    res.status(400).json({ error: "year khong hop le" });
    return null;
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    res.status(400).json({ error: "month khong hop le" });
    return null;
  }

  return { year, month };
};

const executeReportProcedure = async (req, res, procedureName, context) => {
  const params = parseYearMonth(req, res);
  if (!params) {
    return;
  }

  try {
    const request = new sql.Request();
    request.input("Year", sql.Int, params.year);
    request.input("Month", sql.Int, params.month);

    const result = await request.execute(procedureName);
    return res.json(result.recordset?.[0] || {});
  } catch (err) {
    console.error(`${context} Error:`, err);
    return res.status(500).json({ error: "Loi server", detail: err.message });
  }
};

const getRoomOccupancyByMonth = async (req, res) =>
  executeReportProcedure(req, res, "sp_GetRoomOccupancyByMonth", "getRoomOccupancyByMonth");

const getNetRevenueByMonth = async (req, res) =>
  executeReportProcedure(req, res, "sp_GetNetRevenueByMonth", "getNetRevenueByMonth");

const getGuestTypeByMonth = async (req, res) =>
  executeReportProcedure(req, res, "sp_GetGuestTypeByMonth", "getGuestTypeByMonth");

const getReservationCountByMonth = async (req, res) =>
  executeReportProcedure(req, res, "sp_GetReservationCountByMonth", "getReservationCountByMonth");

module.exports = {
  getRoomOccupancyByMonth,
  getNetRevenueByMonth,
  getGuestTypeByMonth,
  getReservationCountByMonth,
};
