const { sql } = require("../config/db");

const getRoomTypes = async (req, res) => {
  console.log("getRoomTypes called");
  try {
    const result = await sql.query`SELECT * FROM RoomTypes`;
    console.log("getRoomTypes result rows:", result.recordset.length);
    res.json(result.recordset);
  } catch (err) {
    console.error("getRoomTypes Error:", err);
    res
      .status(500)
      .json({ error: "Lỗi server", detail: err.message, stack: err.stack });
  }
};

const addRoomType = async (req, res) => {
  console.log("addRoomType called", req.body);
  try {
    const { Name, Description, Capacity, DefaultPrice } = req.body;
    if (!Name || !Capacity || !DefaultPrice) {
      return res.status(400).json({ error: "Thiếu tham số bắt buộc" });
    }

    const result = await sql.query`
      EXEC sp_AddRoomType 
        @Name=${Name},
        @Description=${Description || ""},
        @Capacity=${Capacity},
        @DefaultPrice=${DefaultPrice}
    `;

    return res
      .status(201)
      .json({
        message: "Thêm loại phòng thành công",
        data: result.recordset || [],
      });
  } catch (err) {
    console.error("addRoomType Error:", err);
    res
      .status(500)
      .json({ error: "Lỗi server", detail: err.message, stack: err.stack });
  }
};

const updateRoomType = async (req, res) => {
  console.log("updateRoomType called", req.params, req.body);
  try {
    const RoomTypeID = parseInt(req.params.id, 10);
    const { Name, Description, Capacity, DefaultPrice } = req.body;

    if (!RoomTypeID || !Name || !Capacity || !DefaultPrice) {
      return res
        .status(400)
        .json({ error: "Thiếu tham số bắt buộc hoặc id không hợp lệ" });
    }

    const result = await sql.query`
      EXEC sp_UpdateRoomType
        @RoomTypeID=${RoomTypeID},
        @Name=${Name},
        @Description=${Description || ""},
        @Capacity=${Capacity},
        @DefaultPrice=${DefaultPrice}
    `;

    return res.json({
      message: "Cập nhật loại phòng thành công",
      data: result.recordset || [],
    });
  } catch (err) {
    console.error("updateRoomType Error:", err);
    res
      .status(500)
      .json({ error: "Lỗi server", detail: err.message, stack: err.stack });
  }
};

const deleteRoomType = async (req, res) => {
  console.log("deleteRoomType called", req.params);
  try {
    const RoomTypeID = parseInt(req.params.id, 10);
    if (!RoomTypeID) {
      return res.status(400).json({ error: "id không hợp lệ" });
    }

    await sql.query`
      EXEC sp_DeleteRoomType
        @RoomTypeID=${RoomTypeID}
    `;
    return res.json({ message: "Xóa loại phòng thành công" });
  } catch (err) {
    console.error("deleteRoomType Error:", err);
    res
      .status(500)
      .json({ error: "Lỗi server", detail: err.message, stack: err.stack });
  }
};

module.exports = { getRoomTypes, addRoomType, updateRoomType, deleteRoomType };