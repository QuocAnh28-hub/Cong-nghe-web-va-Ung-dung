const { sql } = require("../config/db");

const getReceptionists = async (req, res) => {
  console.log("getReceptionists called");
  try {
    const result = await sql.query`EXEC GetUserReceptionistInfo`;
    if (!result.recordset) {
      return res.status(404).json({ error: "Không tìm thấy dữ liệu nhân viên" });
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error("getReceptionists Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};

module.exports = { getReceptionists };
