const { sql } = require("../config/db");

const isValidDateString = (value) => {
  if (!value || typeof value !== "string") {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const hasDateOverlap = async ({ RoomTypeID, StartDate, EndDate, excludeRateID = null }) => {
  const result = await sql.query`
    SELECT TOP 1 RateID
    FROM Rates
    WHERE RoomTypeID = ${RoomTypeID}
      AND (${excludeRateID} IS NULL OR RateID <> ${excludeRateID})
      AND ${StartDate} <= EndDate
      AND ${EndDate} >= StartDate
  `;

  return result.recordset.length > 0;
};

const isBusinessRuleError = (message = "") =>
  message.includes("Ngay bat dau phai nho hon hoac bang ngay ket thuc") ||
  message.includes("Khoang thoi gian nay da ton tai gia cho loai phong nay") ||
  message.includes("Khoang thoi gian bi trung voi gia khac cua loai phong nay") ||
  message.includes("Ngày b?t d?u ph?i nh? hon ho?c b?ng ngày k?t thúc") ||
  message.includes("Kho?ng th?i gian này dã t?n t?i giá cho lo?i phòng này") ||
  message.includes("Kho?ng th?i gian b? trùng v?i giá khác c?a lo?i phòng này");

const getRates = async (req, res) => {
  console.log("getRates called");
  try {
    const result = await sql.query`EXEC sp_GetSeasonRate`;
    if (!result.recordset) {
      return res.status(404).json({ error: "Khong tim thay du lieu gia" });
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error("getRates Error:", err);
    return res.status(500).json({ error: "Loi server", detail: err.message });
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
      Number.isNaN(Number(Price)) ||
      !StartDate ||
      !EndDate ||
      !Season
    ) {
      return res.status(400).json({
        error: "Thieu hoac sai tham so: RoomTypeID, Price, StartDate, EndDate, Season",
      });
    }

    if (!isValidDateString(StartDate) || !isValidDateString(EndDate)) {
      return res.status(400).json({ error: "StartDate hoac EndDate khong hop le" });
    }

    if (new Date(StartDate) > new Date(EndDate)) {
      return res
        .status(400)
        .json({ error: "Ngay bat dau phai nho hon hoac bang ngay ket thuc" });
    }

    const duplicated = await hasDateOverlap({ RoomTypeID, StartDate, EndDate });
    if (duplicated) {
      return res.status(400).json({
        error: "Khoang thoi gian nay da ton tai gia cho loai phong nay",
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

    return res.status(201).json({ message: "Them gia theo mua thanh cong" });
  } catch (err) {
    console.error("addRate Error:", err);
    if (isBusinessRuleError(err.message)) {
      return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: "Loi server", detail: err.message });
  }
};

const updateRate = async (req, res) => {
  console.log("updateRate called", req.params, req.body);
  try {
    const rateID = Number.parseInt(req.params.id, 10);
    const { RoomTypeID, Price, StartDate, EndDate, Season } = req.body;

    if (!Number.isInteger(rateID) || rateID <= 0) {
      return res.status(400).json({ error: "RateID khong hop le" });
    }

    const hasUpdateFields =
      RoomTypeID != null ||
      Price != null ||
      StartDate != null ||
      EndDate != null ||
      Season != null;

    if (!hasUpdateFields) {
      return res.status(400).json({ error: "Can it nhat mot truong de cap nhat" });
    }

    if (RoomTypeID != null && (!Number.isInteger(RoomTypeID) || RoomTypeID <= 0)) {
      return res.status(400).json({ error: "RoomTypeID khong hop le" });
    }

    if (Price != null && Number.isNaN(Number(Price))) {
      return res.status(400).json({ error: "Price phai la so hop le" });
    }

    if (
      (StartDate != null && !isValidDateString(StartDate)) ||
      (EndDate != null && !isValidDateString(EndDate))
    ) {
      return res.status(400).json({ error: "StartDate hoac EndDate khong hop le" });
    }

    const currentRateResult = await sql.query`
      SELECT TOP 1 RateID, RoomTypeID, StartDate, EndDate
      FROM Rates
      WHERE RateID = ${rateID}
    `;

    if (currentRateResult.recordset.length === 0) {
      return res.status(404).json({ error: "Khong tim thay gia can cap nhat" });
    }

    const currentRate = currentRateResult.recordset[0];
    const nextRoomTypeID = RoomTypeID ?? currentRate.RoomTypeID;
    const nextStartDate = StartDate ?? currentRate.StartDate;
    const nextEndDate = EndDate ?? currentRate.EndDate;

    if (new Date(nextStartDate) > new Date(nextEndDate)) {
      return res
        .status(400)
        .json({ error: "Ngay bat dau phai nho hon hoac bang ngay ket thuc" });
    }

    const duplicated = await hasDateOverlap({
      RoomTypeID: nextRoomTypeID,
      StartDate: nextStartDate,
      EndDate: nextEndDate,
      excludeRateID: rateID,
    });

    if (duplicated) {
      return res.status(400).json({
        error: "Khoang thoi gian bi trung voi gia khac cua loai phong nay",
      });
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

    return res.json({ message: "Cap nhat gia theo mua thanh cong" });
  } catch (err) {
    console.error("updateRate Error:", err);
    if (isBusinessRuleError(err.message)) {
      return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: "Loi server", detail: err.message });
  }
};

const deleteRate = async (req, res) => {
  console.log("deleteRate called", req.params);
  try {
    const rateID = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(rateID) || rateID <= 0) {
      return res.status(400).json({ error: "RateID khong hop le" });
    }

    await sql.query`
      EXEC usp_DeleteSeasonalRate
        @RateID=${rateID}
    `;

    return res.json({ message: "Xoa gia theo mua thanh cong" });
  } catch (err) {
    console.error("deleteRate Error:", err);
    return res.status(500).json({ error: "Loi server", detail: err.message });
  }
};

module.exports = { getRates, addRate, updateRate, deleteRate };
