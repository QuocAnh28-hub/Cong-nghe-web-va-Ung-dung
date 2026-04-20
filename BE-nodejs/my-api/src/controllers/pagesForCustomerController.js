const { sql } = require("../config/db");

const getRoomTypesWithCurrentRate = async (req, res) => {
  console.log("getRoomTypesWithCurrentRate called");
  try {
    const result = await sql.query`
      EXEC sp_GetAllRoomTypesWithCurrentRate
    `;
    res.json(result.recordset);
  } catch (err) {
    console.error("getRoomTypesWithCurrentRate Error:", err);
    res.status(500).json({
      error: "Lỗi server",
      detail: err.message,
      stack: err.stack,
    });
  }
};

module.exports = { getRoomTypesWithCurrentRate };
