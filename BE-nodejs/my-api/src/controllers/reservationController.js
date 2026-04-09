const { sql } = require("../config/db");

const REPLACEMENT_CHAR_PATTERN = /\uFFFD/g;
const MOJIBAKE_MARKER_PATTERN = /\u00C3|\u00C6|\u00C2|\u00EF\u00BF\u00BD/g;

const normalizeMessage = (value) => String(value || "").replace(/\s+/g, " ").trim();

const countBrokenEncodingMarkers = (value) => {
  if (!value) return Number.POSITIVE_INFINITY;

  const replacementCharCount = (value.match(REPLACEMENT_CHAR_PATTERN) || []).length;
  const mojibakeCharCount = (value.match(MOJIBAKE_MARKER_PATTERN) || []).length;
  return replacementCharCount * 5 + mojibakeCharCount * 3;
};

const tryRepairMojibake = (value) => {
  const message = normalizeMessage(value);
  if (!message) return "";

  try {
    return normalizeMessage(Buffer.from(message, "latin1").toString("utf8"));
  } catch {
    return message;
  }
};

const pickReadableMessage = (value) => {
  const original = normalizeMessage(value);
  const repaired = tryRepairMojibake(original);

  return countBrokenEncodingMarkers(repaired) < countBrokenEncodingMarkers(original)
    ? repaired
    : original;
};

const toLooseAscii = (value) =>
  normalizeMessage(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .toLowerCase();

const resolveFallbackMessage = (err, message) => {
  const sqlNumber =
    err?.number || err?.originalError?.info?.number || err?.originalError?.code;
  const normalized = toLooseAscii(message);
  const compact = normalized.replace(/\s+/g, "");

  if (sqlNumber === 2627 || sqlNumber === 2601 || /unique key|duplicate/.test(normalized)) {
    return "Dữ liệu đã tồn tại";
  }

  if (
    /khong.*phong.*trong.*cap.*nhat/.test(normalized) ||
    compact.includes("khngphngtrngcpnht")
  ) {
    return "Không đủ phòng trống để cập nhật";
  }

  if (sqlNumber === 50000) {
    return "Dữ liệu không hợp lệ theo quy tắc nghiệp vụ";
  }

  if (countBrokenEncodingMarkers(message) > 0) {
    return "Có lỗi dữ liệu từ SQL Server";
  }

  return "";
};

const toPositiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const toDateString = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  const [year, month, day] = normalized.split("-").map(Number);
  const parsedDate = new Date(`${normalized}T00:00:00Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() + 1 !== month ||
    parsedDate.getUTCDate() !== day
  ) {
    return null;
  }

  return normalized;
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

const toPositiveDecimal = (value) => {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const extractSqlErrorMessage = (err) => {
  const raw =
    err?.originalError?.info?.message ||
    err?.precedingErrors?.[0]?.message ||
    err?.message ||
    "";
  const readable = pickReadableMessage(raw);
  const fallback = resolveFallbackMessage(err, readable);

  return fallback || readable || "Lỗi server";
};

const sendSqlError = (res, err, context) => {
  const message = extractSqlErrorMessage(err);
  console.error(`${context} Error: ${message}`);
  if (process.env.DEBUG_SQL_ERRORS === "true") {
    console.error(err);
  }

  const hasSqlBusinessError =
    Boolean(err?.originalError?.info?.message) ||
    (Array.isArray(err?.precedingErrors) && err.precedingErrors.length > 0);

  if (hasSqlBusinessError) {
    return res.status(400).json({ error: message });
  }

  return res.status(500).json({ error: "Lỗi server", detail: message });
};

const resolveUserIDForReservation = async ({ userID, customerID }) => {
  let finalUserID = userID;

  if (!finalUserID && customerID) {
    const customerLookup = await sql.query`
      SELECT TOP 1 UserID
      FROM Customers
      WHERE CustomerID = ${customerID}
    `;

    if (customerLookup.recordset.length === 0) {
      return {
        error: "Không tìm thấy CustomerID trong bảng Customers",
        status: 404,
      };
    }

    finalUserID = customerLookup.recordset[0].UserID;
  }

  if (!finalUserID) {
    return {
      error: "Cần truyền UserID hoặc CustomerID hợp lệ",
      status: 400,
    };
  }

  const userLookup = await sql.query`
    SELECT TOP 1 UserID
    FROM Users
    WHERE UserID = ${finalUserID}
  `;

  if (userLookup.recordset.length === 0) {
    return {
      error:
        "UserID không tồn tại trong Users (có thể bạn đang truyền nhầm CustomerID)",
      status: 404,
    };
  }

  return { userID: finalUserID };
};

const createReservation = async (req, res) => {
  console.log("createReservation called", req.body);
  try {
    const userID = toPositiveInt(req.body.UserID);
    const customerID = toPositiveInt(req.body.CustomerID);
    const roomTypeID = toPositiveInt(req.body.RoomTypeID);
    const quantity = toPositiveInt(req.body.Quantity);
    const checkInDate = toDateString(req.body.CheckInDate);
    const checkOutDate = toDateString(req.body.CheckOutDate);

    if (
      (!userID && !customerID) ||
      !roomTypeID ||
      !quantity ||
      !checkInDate ||
      !checkOutDate
    ) {
      return res.status(400).json({
        error:
          "Thiếu hoặc sai tham số: (UserID hoặc CustomerID), RoomTypeID, Quantity, CheckInDate, CheckOutDate",
      });
    }

    const resolved = await resolveUserIDForReservation({ userID, customerID });
    if (!resolved.userID) {
      return res.status(resolved.status).json({ error: resolved.error });
    }

    const request = new sql.Request();
    request.input("UserID", sql.Int, resolved.userID);
    request.input("RoomTypeID", sql.Int, roomTypeID);
    request.input("Quantity", sql.Int, quantity);
    request.input("CheckInDate", sql.Date, checkInDate);
    request.input("CheckOutDate", sql.Date, checkOutDate);

    const result = await request.execute("sp_CreateReservation");
    const payload = result.recordset?.[0] || null;

    return res
      .status(201)
      .json(payload || { message: "Tạo lịch đặt phòng thành công" });
  } catch (err) {
    return sendSqlError(res, err, "createReservation");
  }
};

const createReservationWithNewCustomer = async (req, res) => {
  console.log("createReservationWithNewCustomer called", req.body);
  try {
    const fullName = (req.body.FullName || "").trim();
    const phone = (req.body.Phone || "").trim();
    const cccd = (req.body.CCCD || "").trim();
    const email = (req.body.Email || "").trim();
    const roomTypeID = toPositiveInt(req.body.RoomTypeID);
    const quantity = toPositiveInt(req.body.Quantity);
    const checkInDate = toDateString(req.body.CheckInDate);
    const checkOutDate = toDateString(req.body.CheckOutDate);

    if (
      !fullName ||
      !phone ||
      !cccd ||
      !email ||
      !roomTypeID ||
      !quantity ||
      !checkInDate ||
      !checkOutDate
    ) {
      return res.status(400).json({
        error:
          "Thiếu hoặc sai tham số: FullName, Phone, CCCD, Email, RoomTypeID, Quantity, CheckInDate, CheckOutDate",
      });
    }

    const request = new sql.Request();
    request.input("FullName", sql.NVarChar(150), fullName);
    request.input("Phone", sql.NVarChar(20), phone);
    request.input("CCCD", sql.NVarChar(20), cccd);
    request.input("Email", sql.NVarChar(150), email);
    request.input("RoomTypeID", sql.Int, roomTypeID);
    request.input("Quantity", sql.Int, quantity);
    request.input("CheckInDate", sql.Date, checkInDate);
    request.input("CheckOutDate", sql.Date, checkOutDate);

    const result = await request.execute("sp_CreateReservation_WithNewCustomer");
    const payload = result.recordset?.[0] || null;

    return res
      .status(201)
      .json(payload || { message: "Tạo khách mới và đặt phòng thành công" });
  } catch (err) {
    return sendSqlError(res, err, "createReservationWithNewCustomer");
  }
};

const getReservationHistoryByUser = async (req, res) => {
  console.log("getReservationHistoryByUser called", req.params);
  try {
    const userID = toPositiveInt(req.params.userId);

    if (!userID) {
      return res.status(400).json({ error: "UserID không hợp lệ" });
    }

    const request = new sql.Request();
    request.input("UserID", sql.Int, userID);

    const result = await request.execute("sp_GetReservationHistory_ByUser");

    return res.json(result.recordset || []);
  } catch (err) {
    return sendSqlError(res, err, "getReservationHistoryByUser");
  }
};

const getAllReservations = async (req, res) => {
  console.log("getAllReservations called");
  try {
    const request = new sql.Request();
    const result = await request.execute("sp_GetAllReservations");

    return res.json(result.recordset || []);
  } catch (err) {
    return sendSqlError(res, err, "getAllReservations");
  }
};

const updateReservation = async (req, res) => {
  console.log("updateReservation called", req.params, req.body);
  try {
    const reservationID = toPositiveInt(req.params.id);
    const roomTypeID = toPositiveInt(req.body.RoomTypeID);
    const quantity = toPositiveInt(req.body.Quantity);
    const checkInDate = toDateString(req.body.CheckInDate);
    const checkOutDate = toDateString(req.body.CheckOutDate);

    if (
      !reservationID ||
      !roomTypeID ||
      !quantity ||
      !checkInDate ||
      !checkOutDate
    ) {
      return res.status(400).json({
        error:
          "Thiếu hoặc sai tham số: ReservationID, RoomTypeID, Quantity, CheckInDate, CheckOutDate",
      });
    }

    const request = new sql.Request();
    request.input("ReservationID", sql.Int, reservationID);
    request.input("RoomTypeID", sql.Int, roomTypeID);
    request.input("Quantity", sql.Int, quantity);
    request.input("CheckInDate", sql.Date, checkInDate);
    request.input("CheckOutDate", sql.Date, checkOutDate);

    const result = await request.execute("sp_UpdateReservation");
    const payload = result.recordset?.[0] || null;

    return res.json(payload || { message: "Cập nhật lịch đặt phòng thành công" });
  } catch (err) {
    return sendSqlError(res, err, "updateReservation");
  }
};

const cancelReservation = async (req, res) => {
  console.log("cancelReservation called", req.params);
  try {
    const reservationID = toPositiveInt(req.params.id);

    if (!reservationID) {
      return res.status(400).json({ error: "ReservationID không hợp lệ" });
    }

    const request = new sql.Request();
    request.input("ReservationID", sql.Int, reservationID);

    const result = await request.execute("sp_CancelReservation");
    const payload = result.recordset?.[0] || null;

    return res.json(payload || { message: "Hủy lịch đặt phòng thành công" });
  } catch (err) {
    return sendSqlError(res, err, "cancelReservation");
  }
};

const getWaitingCheckInCustomers = async (req, res) => {
  console.log("getWaitingCheckInCustomers called");
  try {
    const request = new sql.Request();
    const result = await request.execute("sp_GetWaitingCheckInCustomers");

    return res.json(result.recordset || []);
  } catch (err) {
    return sendSqlError(res, err, "getWaitingCheckInCustomers");
  }
};

const getCurrentStayingCustomers = async (req, res) => {
  console.log("getCurrentStayingCustomers called");
  try {
    const request = new sql.Request();
    const result = await request.execute("sp_GetCurrentStayingCustomers");

    return res.json(result.recordset || []);
  } catch (err) {
    return sendSqlError(res, err, "getCurrentStayingCustomers");
  }
};

const getAvailableRoomsForCheckIn = async (req, res) => {
  console.log("getAvailableRoomsForCheckIn called", req.params, req.query);
  try {
    const reservationID = toPositiveInt(
      req.params.reservationId || req.query.reservationId,
    );

    if (!reservationID) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: reservationId",
      });
    }

    const request = new sql.Request();
    request.input("ReservationID", sql.Int, reservationID);
    const result = await request.execute("sp_GetAvailableRooms_ForCheckIn");

    return res.json(result.recordset || []);
  } catch (err) {
    return sendSqlError(res, err, "getAvailableRoomsForCheckIn");
  }
};

const checkInByReservationOneRoom = async (req, res) => {
  console.log("checkInByReservationOneRoom called", req.body);
  try {
    const reservationID = toPositiveInt(req.body.ReservationID);
    const roomID = toPositiveInt(req.body.RoomID);

    if (!reservationID || !roomID) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: ReservationID, RoomID",
      });
    }

    const request = new sql.Request();
    request.input("ReservationID", sql.Int, reservationID);
    request.input("RoomID", sql.Int, roomID);

    const result = await request.execute("sp_CheckIn_ByReservation_OneRoom");
    const payload = result.recordset?.[0] || null;

    return res
      .status(201)
      .json(payload || { message: "Check-in theo dat phong thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "checkInByReservationOneRoom");
  }
};

const checkInWalkInOneRoom = async (req, res) => {
  console.log("checkInWalkInOneRoom called", req.body);
  try {
    const fullName = (req.body.FullName || "").trim();
    const cccd = (req.body.CCCD || "").trim();
    const roomID = toPositiveInt(req.body.RoomID);
    const expectedCheckOut = toDateTime(req.body.ExpectedCheckOut);

    if (!fullName || !cccd || !roomID || !expectedCheckOut) {
      return res.status(400).json({
        error:
          "Thieu hoac sai tham so: FullName, CCCD, RoomID, ExpectedCheckOut(ISO datetime)",
      });
    }

    const request = new sql.Request();
    request.input("FullName", sql.NVarChar(150), fullName);
    request.input("CCCD", sql.NVarChar(20), cccd);
    request.input("RoomID", sql.Int, roomID);
    request.input("ExpectedCheckOut", sql.DateTime, expectedCheckOut);

    const result = await request.execute("sp_CheckIn_WalkIn_OneRoom");
    const payload = result.recordset?.[0] || null;

    return res.status(201).json(payload || { message: "Check-in walk-in thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "checkInWalkInOneRoom");
  }
};

const transferRoom = async (req, res) => {
  console.log("transferRoom called", req.body);
  try {
    const stayID = toPositiveInt(req.body.StayID);
    const oldRoomID = toPositiveInt(req.body.OldRoomID);
    const newRoomID = toPositiveInt(req.body.NewRoomID);

    if (!stayID || !oldRoomID || !newRoomID) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: StayID, OldRoomID, NewRoomID",
      });
    }

    const request = new sql.Request();
    request.input("StayID", sql.Int, stayID);
    request.input("OldRoomID", sql.Int, oldRoomID);
    request.input("NewRoomID", sql.Int, newRoomID);

    const result = await request.execute("sp_TransferRoom");
    const payload = result.recordset?.[0] || null;

    return res.json(payload || { message: "Chuyen phong thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "transferRoom");
  }
};

const extendStay = async (req, res) => {
  console.log("extendStay called", req.params, req.body);
  try {
    const stayID = toPositiveInt(req.params.stayId || req.body.StayID);
    const newCheckOut = toDateTime(req.body.NewCheckOut);

    if (!stayID || !newCheckOut) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: StayID, NewCheckOut (ISO datetime)",
      });
    }

    const request = new sql.Request();
    request.input("StayID", sql.Int, stayID);
    request.input("NewCheckOut", sql.DateTime, newCheckOut);

    const result = await request.execute("sp_ExtendStay");
    const payload = result.recordset?.[0] || null;

    return res.json(payload || { message: "Gia han luu tru thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "extendStay");
  }
};

const checkOutRoom = async (req, res) => {
  console.log("checkOutRoom called", req.body);
  try {
    const stayID = toPositiveInt(req.body.StayID);
    const roomID = toPositiveInt(req.body.RoomID);

    if (!stayID || !roomID) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: StayID, RoomID",
      });
    }

    const request = new sql.Request();
    request.input("StayID", sql.Int, stayID);
    request.input("RoomID", sql.Int, roomID);

    const result = await request.execute("sp_CheckOutRoom");
    const payload = result.recordset?.[0] || null;

    return res.json(payload || { message: "Check-out phong thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "checkOutRoom");
  }
};

const addServiceUsage = async (req, res) => {
  console.log("addServiceUsage called", req.params, req.body);
  try {
    const stayID = toPositiveInt(req.params.stayId || req.body.StayID);
    const serviceID = toPositiveInt(req.body.ServiceID);
    const quantity = toPositiveInt(req.body.Quantity);

    if (!stayID || !serviceID || !quantity) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: StayID, ServiceID, Quantity",
      });
    }

    const request = new sql.Request();
    request.input("StayID", sql.Int, stayID);
    request.input("ServiceID", sql.Int, serviceID);
    request.input("Quantity", sql.Int, quantity);

    await request.execute("sp_AddServiceUsage");
    return res.status(201).json({ message: "Them dich vu su dung thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "addServiceUsage");
  }
};

const updateServiceUsage = async (req, res) => {
  console.log("updateServiceUsage called", req.params, req.body);
  try {
    const usageID = toPositiveInt(req.params.usageId || req.body.UsageID);
    const quantity = toPositiveInt(req.body.Quantity);

    if (!usageID || !quantity) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: UsageID, Quantity",
      });
    }

    const request = new sql.Request();
    request.input("UsageID", sql.Int, usageID);
    request.input("Quantity", sql.Int, quantity);

    await request.execute("sp_UpdateServiceUsage");
    return res.json({ message: "Cap nhat dich vu su dung thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "updateServiceUsage");
  }
};

const deleteServiceUsage = async (req, res) => {
  console.log("deleteServiceUsage called", req.params);
  try {
    const usageID = toPositiveInt(req.params.usageId || req.body.UsageID);

    if (!usageID) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: UsageID",
      });
    }

    const request = new sql.Request();
    request.input("UsageID", sql.Int, usageID);

    await request.execute("sp_DeleteServiceUsage");
    return res.json({ message: "Xoa dich vu su dung thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "deleteServiceUsage");
  }
};

const getServiceUsageByStay = async (req, res) => {
  console.log("getServiceUsageByStay called", req.params, req.query);
  try {
    const stayID = toPositiveInt(req.params.stayId || req.query.stayId);

    if (!stayID) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: StayID",
      });
    }

    const request = new sql.Request();
    request.input("StayID", sql.Int, stayID);
    const result = await request.execute("sp_GetServiceUsageByStay");

    return res.json(result.recordset || []);
  } catch (err) {
    return sendSqlError(res, err, "getServiceUsageByStay");
  }
};

const addMinibarUsage = async (req, res) => {
  console.log("addMinibarUsage called", req.params, req.body);
  try {
    const stayID = toPositiveInt(req.params.stayId || req.body.StayID);
    const minibarID = toPositiveInt(req.body.MinibarID);
    const quantity = toPositiveInt(req.body.Quantity);

    if (!stayID || !minibarID || !quantity) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: StayID, MinibarID, Quantity",
      });
    }

    const request = new sql.Request();
    request.input("StayID", sql.Int, stayID);
    request.input("MinibarID", sql.Int, minibarID);
    request.input("Quantity", sql.Int, quantity);

    await request.execute("sp_AddMinibarUsage");
    return res.status(201).json({ message: "Them minibar usage thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "addMinibarUsage");
  }
};

const updateMinibarUsage = async (req, res) => {
  console.log("updateMinibarUsage called", req.params, req.body);
  try {
    const id = toPositiveInt(req.params.id || req.body.ID);
    const quantity = toPositiveInt(req.body.Quantity);

    if (!id || !quantity) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: ID, Quantity",
      });
    }

    const request = new sql.Request();
    request.input("ID", sql.Int, id);
    request.input("Quantity", sql.Int, quantity);

    await request.execute("sp_UpdateMinibarUsage");
    return res.json({ message: "Cap nhat minibar usage thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "updateMinibarUsage");
  }
};

const deleteMinibarUsage = async (req, res) => {
  console.log("deleteMinibarUsage called", req.params);
  try {
    const id = toPositiveInt(req.params.id || req.body.ID);

    if (!id) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: ID",
      });
    }

    const request = new sql.Request();
    request.input("ID", sql.Int, id);

    await request.execute("sp_DeleteMinibarUsage");
    return res.json({ message: "Xoa minibar usage thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "deleteMinibarUsage");
  }
};

const getMinibarUsageByStay = async (req, res) => {
  console.log("getMinibarUsageByStay called", req.params, req.query);
  try {
    const stayID = toPositiveInt(req.params.stayId || req.query.stayId);

    if (!stayID) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: StayID",
      });
    }

    const request = new sql.Request();
    request.input("StayID", sql.Int, stayID);
    const result = await request.execute("sp_GetMinibarUsageByStay");

    return res.json(result.recordset || []);
  } catch (err) {
    return sendSqlError(res, err, "getMinibarUsageByStay");
  }
};

const getMinibarByRoom = async (req, res) => {
  console.log("getMinibarByRoom called", req.params, req.query);
  try {
    const roomID = toPositiveInt(req.params.roomId || req.query.roomId);

    if (!roomID) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: RoomID",
      });
    }

    const request = new sql.Request();
    request.input("RoomID", sql.Int, roomID);
    const result = await request.execute("sp_GetMinibarByRoom");

    return res.json(result.recordset || []);
  } catch (err) {
    return sendSqlError(res, err, "getMinibarByRoom");
  }
};

const addPenalty = async (req, res) => {
  console.log("addPenalty called", req.params, req.body);
  try {
    const stayID = toPositiveInt(req.params.stayId || req.body.StayID);
    const reason = (req.body.Reason || "").trim();
    const amount = toPositiveDecimal(req.body.Amount);

    if (!stayID || !reason || !amount) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: StayID, Reason, Amount",
      });
    }

    const request = new sql.Request();
    request.input("StayID", sql.Int, stayID);
    request.input("Reason", sql.NVarChar(255), reason);
    request.input("Amount", sql.Decimal(14, 2), amount);

    await request.execute("sp_AddPenalty");
    return res.status(201).json({ message: "Them penalty thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "addPenalty");
  }
};

const updatePenalty = async (req, res) => {
  console.log("updatePenalty called", req.params, req.body);
  try {
    const penaltyID = toPositiveInt(req.params.penaltyId || req.body.PenaltyID);
    const reason = (req.body.Reason || "").trim();
    const amount = toPositiveDecimal(req.body.Amount);

    if (!penaltyID || !reason || !amount) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: PenaltyID, Reason, Amount",
      });
    }

    const request = new sql.Request();
    request.input("PenaltyID", sql.Int, penaltyID);
    request.input("Reason", sql.NVarChar(255), reason);
    request.input("Amount", sql.Decimal(14, 2), amount);

    await request.execute("sp_UpdatePenalty");
    return res.json({ message: "Cap nhat penalty thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "updatePenalty");
  }
};

const deletePenalty = async (req, res) => {
  console.log("deletePenalty called", req.params);
  try {
    const penaltyID = toPositiveInt(req.params.penaltyId || req.body.PenaltyID);

    if (!penaltyID) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: PenaltyID",
      });
    }

    const request = new sql.Request();
    request.input("PenaltyID", sql.Int, penaltyID);

    await request.execute("sp_DeletePenalty");
    return res.json({ message: "Xoa penalty thanh cong" });
  } catch (err) {
    return sendSqlError(res, err, "deletePenalty");
  }
};

const getPenaltyByStay = async (req, res) => {
  console.log("getPenaltyByStay called", req.params, req.query);
  try {
    const stayID = toPositiveInt(req.params.stayId || req.query.stayId);

    if (!stayID) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: StayID",
      });
    }

    const request = new sql.Request();
    request.input("StayID", sql.Int, stayID);
    const result = await request.execute("sp_GetPenaltyByStay");

    return res.json(result.recordset || []);
  } catch (err) {
    return sendSqlError(res, err, "getPenaltyByStay");
  }
};

const getRoomStayHistoryCheckedOutByStay = async (req, res) => {
  console.log("getRoomStayHistoryCheckedOutByStay called", req.params, req.query);
  try {
    const stayID = toPositiveInt(req.params.stayId || req.query.stayId);

    if (!stayID) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: StayID",
      });
    }

    const request = new sql.Request();
    request.input("StayID", sql.Int, stayID);
    const result = await request.execute("sp_GetRoomStayHistory_CheckedOut_ByStayID");

    return res.json(result.recordset || []);
  } catch (err) {
    return sendSqlError(res, err, "getRoomStayHistoryCheckedOutByStay");
  }
};

module.exports = {
  createReservation,
  createReservationWithNewCustomer,
  getReservationHistoryByUser,
  getAllReservations,
  updateReservation,
  cancelReservation,
  getWaitingCheckInCustomers,
  getCurrentStayingCustomers,
  getAvailableRoomsForCheckIn,
  checkInByReservationOneRoom,
  checkInWalkInOneRoom,
  transferRoom,
  extendStay,
  checkOutRoom,
  addServiceUsage,
  updateServiceUsage,
  deleteServiceUsage,
  getServiceUsageByStay,
  addMinibarUsage,
  updateMinibarUsage,
  deleteMinibarUsage,
  getMinibarUsageByStay,
  getMinibarByRoom,
  addPenalty,
  updatePenalty,
  deletePenalty,
  getPenaltyByStay,
  getRoomStayHistoryCheckedOutByStay,
};