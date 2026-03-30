const { sql } = require("../config/db");

const getRooms = async (req, res) => {
  console.log("getRooms called");
  try {
    const result = await sql.query`EXEC GetRooms`;
    if (!result.recordset) {
      return res.status(404).json({ error: "Không tìm thấy dữ liệu phòng" });
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error("getRooms Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};

module.exports = { getRooms };
