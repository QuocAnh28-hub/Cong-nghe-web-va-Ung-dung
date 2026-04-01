const { sql } = require("../config/db");
const crypto = require("crypto");

const getReceptionists = async (req, res) => {
  console.log("getReceptionists called");
  try {
    const result = await sql.query`EXEC sp_GetActiveReceptionists`;
    if (!result.recordset) {
      return res.status(404).json({ error: "Không tìm thấy dữ liệu nhân viên" });
    }

    return res.json(result.recordset);
  } catch (err) {
    console.error("getReceptionists Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};

const createReceptionist = async (req, res) => {
  console.log("createReceptionist called", req.body);
  try {
    const { Email, PasswordHash, Password, FullName, Phone } = req.body;
    const email = (Email || "").trim();
    const fullName = (FullName || "").trim();
    const phone = (Phone || "").trim();
    let passwordHash = (PasswordHash || "").trim();
    const password = (Password || "").trim();

    if (!email || !fullName || !phone) {
      return res.status(400).json({
        error: "Email, FullName và Phone là bắt buộc",
      });
    }

    if (!passwordHash && !password) {
      return res.status(400).json({
        error: "Password hoặc PasswordHash là bắt buộc",
      });
    }

    if (!passwordHash && password) {
      passwordHash = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
    }

    console.log(`Calling sp_CreateReceptionist for email=${email}`);
    const result = await sql.query`
      EXEC sp_CreateReceptionist
        @Email=${email},
        @PasswordHash=${passwordHash},
        @FullName=${fullName},
        @Phone=${phone}
    `;

    return res.status(201).json({
      message: "Tạo nhân viên lễ tân thành công",
      data: { Email: email, FullName: fullName, Phone: phone },
    });
  } catch (err) {
    console.error("createReceptionist Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};

const updateReceptionist = async (req, res) => {
  console.log("updateReceptionist called", req.body);
  try {
    const userID = Number(req.body.UserID || req.body.id);
    if (!userID || Number.isNaN(userID)) {
      return res.status(400).json({ error: "UserID không hợp lệ" });
    }

    const { Email, PasswordHash, Password, NewPassword, FullName, Phone } = req.body;
    const emailInput = Email ? String(Email).trim() : undefined;
    const fullNameInput = FullName ? String(FullName).trim() : undefined;
    const phoneInput = Phone ? String(Phone).trim() : undefined;
    let passwordHash = PasswordHash ? String(PasswordHash).trim() : undefined;
    const password = Password ? String(Password).trim() : undefined;
    const newPassword = NewPassword ? String(NewPassword).trim() : undefined;
    const passwordValue = newPassword || password;

    const currentResult = await sql.query`
      SELECT u.Email, u.PasswordHash, r.FullName, r.Phone
      FROM Users u
      JOIN Receptionists r ON u.UserID = r.UserID
      WHERE u.UserID = ${userID}
    `;
    if (!currentResult.recordset || currentResult.recordset.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy receptionist với UserID này" });
    }

    const current = currentResult.recordset[0];
    const email = emailInput && emailInput.length > 0 ? emailInput : current.Email;
    const fullName = fullNameInput && fullNameInput.length > 0 ? fullNameInput : current.FullName;
    const phone = phoneInput && phoneInput.length > 0 ? phoneInput : current.Phone;

    if (!passwordHash && passwordValue) {
      passwordHash = passwordValue;
    }

    if (!passwordHash) {
      passwordHash = current.PasswordHash;
    }

    console.log(`Calling sp_UpdateReceptionist for UserID=${userID}`);
    await sql.query`
      EXEC sp_UpdateReceptionist
        @UserID=${userID},
        @Email=${email},
        @PasswordHash=${passwordHash},
        @FullName=${fullName},
        @Phone=${phone}
    `;

    return res.json({
      message: "Cập nhật nhân viên lễ tân thành công",
      data: { UserID: userID, Email: email, FullName: fullName, Phone: phone },
    });
  } catch (err) {
    console.error("updateReceptionist Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};

const deleteReceptionist = async (req, res) => {
  console.log("deleteReceptionist called", req.body);
  try {
    const userID = Number(req.body.UserID || req.body.id);
    if (!userID || Number.isNaN(userID)) {
      return res.status(400).json({ error: "UserID không hợp lệ" });
    }

    const result = await sql.query`
      EXEC sp_DeleteReceptionist
        @UserID=${userID}
    `;

    if (result.rowsAffected && result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Không tìm thấy receptionist để xóa" });
    }

    return res.json({ message: "Xóa nhân viên lễ tân thành công", UserID: userID });
  } catch (err) {
    console.error("deleteReceptionist Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};

module.exports = { getReceptionists, createReceptionist, updateReceptionist, deleteReceptionist };
