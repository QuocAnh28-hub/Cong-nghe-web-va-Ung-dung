const { sql } = require("../config/db");

const executeOverviewProcedure = async (res, procedureName, context) => {
  try {
    const request = new sql.Request();
    const result = await request.execute(procedureName);

    return res.json(result.recordset?.[0] || {});
  } catch (err) {
    console.error(`${context} Error:`, err);
    return res.status(500).json({ error: "Loi server", detail: err.message });
  }
};

const getRoomStatistics = async (req, res) =>
  executeOverviewProcedure(res, "sp_GetRoomStatistics", "getRoomStatistics");

const getOccupancyRate = async (req, res) =>
  executeOverviewProcedure(res, "sp_GetOccupancyRate", "getOccupancyRate");

const getRoomStatusSummary = async (req, res) =>
  executeOverviewProcedure(res, "sp_GetRoomStatusSummary", "getRoomStatusSummary");

const getCustomerSummary = async (req, res) =>
  executeOverviewProcedure(res, "sp_GetCustomerSummary", "getCustomerSummary");

module.exports = {
  getRoomStatistics,
  getOccupancyRate,
  getRoomStatusSummary,
  getCustomerSummary,
};
