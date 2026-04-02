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

const addRate = async (req, res) => {
  console.log("addRate called", req.body);
  try {
    const { RoomTypeID, Price, StartDate, EndDate, Season } = req.body;

    if (
      !Number.isInteger(RoomTypeID) ||
      RoomTypeID <= 0 ||
      Price == null ||
      isNaN(Number(Price)) ||
      !StartDate ||
      !EndDate ||
      !Season
    ) {
      return res.status(400).json({
        error:
          "Thiếu hoặc sai tham số: RoomTypeID, Price, StartDate, EndDate, Season",
      });
    }

    await sql.query`
      EXEC usp_InsertRate
        @RoomTypeID=${RoomTypeID},
        @Price=${Price},
        @StartDate=${StartDate},
        @EndDate=${EndDate},
        @Season=${Season}
    `;

    return res.status(201).json({ message: "Thêm giá theo mùa thành công" });
  } catch (err) {
    console.error("addRate Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};

const updateRate = async (req, res) => {
  console.log("updateRate called", req.params, req.body);
  try {
    const rateID = Number.parseInt(req.params.id, 10);
    const { RoomTypeID, Price, StartDate, EndDate, Season } = req.body;

    if (!Number.isInteger(rateID) || rateID <= 0) {
      return res.status(400).json({ error: "RateID không hợp lệ" });
    }

    const hasUpdateFields =
      RoomTypeID != null ||
      Price != null ||
      StartDate ||
      EndDate ||
      Season;

    if (!hasUpdateFields) {
      return res
        .status(400)
        .json({ error: "Cần ít nhất một trường để cập nhật" });
    }

    if (RoomTypeID != null && (!Number.isInteger(RoomTypeID) || RoomTypeID <= 0)) {
      return res.status(400).json({ error: "RoomTypeID không hợp lệ" });
    }

    if (Price != null && isNaN(Number(Price))) {
      return res.status(400).json({ error: "Price phải là số hợp lệ" });
    }

    await sql.query`
      EXEC usp_UpdateSeasonalRate
        @RateID=${rateID},
        @RoomTypeID=${RoomTypeID ?? null},
        @Price=${Price ?? null},
        @StartDate=${StartDate ?? null},
        @EndDate=${EndDate ?? null},
        @Season=${Season ?? null}
    `;

    return res.json({ message: "Cập nhật giá theo mùa thành công" });
  } catch (err) {
    console.error("updateRate Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};

const deleteRate = async (req, res) => {
  console.log("deleteRate called", req.params);
  try {
    const rateID = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(rateID) || rateID <= 0) {
      return res.status(400).json({ error: "RateID không hợp lệ" });
    }

    await sql.query`
      EXEC usp_DeleteSeasonalRate
        @RateID=${rateID}
    `;

    return res.json({ message: "Xóa giá theo mùa thành công" });
  } catch (err) {
    console.error("deleteRate Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};

module.exports = { getRates, addRate, updateRate, deleteRate };
