const { sql } = require("../config/db");

const getRates = async (req, res) => {
  console.log("getRates called");
  try {
    const result = await sql.query`EXEC sp_GetSeasonRate`;
    if (!result.recordset) {
      return res.status(404).json({ error: "Không tìm thấy dữ liệu giá" });
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error("getRates Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};

module.exports = { getRates };
