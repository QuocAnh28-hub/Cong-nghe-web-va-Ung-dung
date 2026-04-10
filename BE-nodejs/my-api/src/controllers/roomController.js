const { sql } = require("../config/db");

const getRooms = async (req, res) => {
  console.log("getRooms called");
  try {
    const request = new sql.Request();
    const result = await request.execute("GetRooms");

    return res.json(result.recordset || []);
  } catch (err) {
    console.error("getRooms Error:", err);
    return res.status(500).json({ error: "Loi server", detail: err.message });
  }
};

const getRoomCalendar = async (req, res) => {
  console.log("getRoomCalendar called", req.query);
  try {
    const month = Number.parseInt(req.query.month, 10);
    const year = Number.parseInt(req.query.year, 10);

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: "month phai la so tu 1 den 12" });
    }

    if (!Number.isInteger(year) || year < 1900 || year > 9999) {
      return res
        .status(400)
        .json({ error: "year phai la so hop le (1900 - 9999)" });
    }

    const request = new sql.Request();
    request.input("Month", sql.Int, month);
    request.input("Year", sql.Int, year);
    const result = await request.execute("sp_GetRoomCalendar_Advanced");

    return res.json({
      month,
      year,
      data: result.recordset || [],
    });
  } catch (err) {
    console.error("getRoomCalendar Error:", err);
    return res.status(500).json({ error: "Loi server", detail: err.message });
  }
};

const toDateTime = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const getAvailableRoomsAdvanced = async (req, res) => {
  console.log("getAvailableRoomsAdvanced called", req.query, req.body);
  try {
    const expectedCheckOut = toDateTime(
      req.query.ExpectedCheckOut ||
        req.query.expectedCheckOut ||
        req.body?.ExpectedCheckOut,
    );

    if (!expectedCheckOut) {
      return res.status(400).json({
        error:
          "Thieu hoac sai tham so: ExpectedCheckOut (ISO datetime). Vi du: 2026-04-15T12:00:00",
      });
    }

    const request = new sql.Request();
    request.input("ExpectedCheckOut", sql.DateTime, expectedCheckOut);
    const result = await request.execute("sp_GetAvailableRooms_Advanced");

    return res.json(result.recordset || []);
  } catch (err) {
    console.error("getAvailableRoomsAdvanced Error:", err);
    return res.status(500).json({ error: "Loi server", detail: err.message });
  }
};

const addRoom = async (req, res) => {
  console.log("addRoom called", req.body);
  try {
    const { RoomNumber, Status, RoomTypeID } = req.body;
    const roomTypeIdNum = Number(RoomTypeID);

    if (
      !RoomNumber ||
      !Status ||
      !Number.isInteger(roomTypeIdNum) ||
      roomTypeIdNum <= 0
    ) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: RoomNumber, Status, RoomTypeID",
      });
    }

    const checkDuplicate = await sql.query`
      SELECT TOP 1 RoomID
      FROM Rooms
      WHERE RoomNumber = ${String(RoomNumber).trim()}
    `;

    if (checkDuplicate.recordset.length > 0) {
      return res.status(409).json({ error: "Phong da ton tai" });
    }

    const request = new sql.Request();
    request.input("RoomNumber", sql.NVarChar(50), String(RoomNumber).trim());
    request.input("Status", sql.NVarChar(50), String(Status).trim());
    request.input("RoomTypeID", sql.Int, roomTypeIdNum);

    await request.execute("AddRoom");

    return res.status(201).json({ message: "Them phong thanh cong" });
  } catch (err) {
    console.error("addRoom Error:", err);
    return res.status(500).json({ error: "Loi server", detail: err.message });
  }
};

const updateRoom = async (req, res) => {
  console.log("updateRoom called", req.params, req.body);
  try {
    const roomId = Number.parseInt(req.params.id, 10);
    const { RoomNumber, Status, RoomTypeID } = req.body;
    const roomTypeIdNum = Number(RoomTypeID);

    if (!Number.isInteger(roomId) || roomId <= 0) {
      return res.status(400).json({ error: "RoomID khong hop le" });
    }

    if (
      !RoomNumber ||
      !Status ||
      !Number.isInteger(roomTypeIdNum) ||
      roomTypeIdNum <= 0
    ) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: RoomNumber, Status, RoomTypeID",
      });
    }

    const checkRoomExists = await sql.query`
      SELECT TOP 1 RoomID
      FROM Rooms
      WHERE RoomID = ${roomId}
    `;

    if (checkRoomExists.recordset.length === 0) {
      return res.status(404).json({ error: "Phong khong ton tai" });
    }

    const checkDuplicateNumber = await sql.query`
      SELECT TOP 1 RoomID
      FROM Rooms
      WHERE RoomNumber = ${String(RoomNumber).trim()}
        AND RoomID <> ${roomId}
    `;

    if (checkDuplicateNumber.recordset.length > 0) {
      return res.status(409).json({ error: "So phong da ton tai" });
    }

    const request = new sql.Request();
    request.input("RoomID", sql.Int, roomId);
    request.input("RoomNumber", sql.NVarChar(50), String(RoomNumber).trim());
    request.input("Status", sql.NVarChar(50), String(Status).trim());
    request.input("RoomTypeID", sql.Int, roomTypeIdNum);

    await request.execute("UpdateRoom");

    return res.json({ message: "Cap nhat phong thanh cong" });
  } catch (err) {
    console.error("updateRoom Error:", err);
    return res.status(500).json({ error: "Loi server", detail: err.message });
  }
};

module.exports = {
  getRooms,
  getRoomCalendar,
  getAvailableRoomsAdvanced,
  addRoom,
  updateRoom,
};