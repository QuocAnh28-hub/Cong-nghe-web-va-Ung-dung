const { sql } = require("../config/db");

const isRegisterBusinessError = (message = "") =>
  message.includes("Email da ton tai") || message.includes("Email đã tồn tại");

const login = async (req, res) => {
  console.log("login called", req.body);

  try {
    const { Email, PasswordHash, Password } = req.body;
    const email = (Email || "").trim();
    const passwordHash = (PasswordHash || "").trim();
    const password = (Password || "").trim();

    if (!email || (!passwordHash && !password)) {
      return res.status(400).json({
        error: "Email và mật khẩu (Password hoặc PasswordHash) là bắt buộc",
      });
    }

    // Sử dụng PasswordHash nếu có, nếu không thì hash Password thành SHA256
    let finalPasswordHash = passwordHash;
    if (!finalPasswordHash && password) {
      finalPasswordHash = password;
    }

    console.log(
      `Trying stored proc GetAccountInfo with Email: ${email}, PasswordHash: ${finalPasswordHash}`,
    );
    const result = await sql.query`
      EXEC GetAccountInfo
        @Email=${email},
        @PasswordHash=${finalPasswordHash}
    `;

    // stored proc có 2 result set (Customers + Receptionists)
    const candidateRecordsets = result.recordsets || [];
    let account = null;
    for (const rs of candidateRecordsets) {
      if (rs && rs.length > 0) {
        account = rs[0];
        break;
      }
    }

    if (!account) {
      console.log("No account found, returning 401");
      return res.status(401).json({
        error: "Đăng nhập không thành công, Email hoặc mật khẩu sai.",
      });
    }

    console.log("Account found:", account);
    const { PasswordHash: _, ...payload } = account;

    return res.json({ message: "Đăng nhập thành công", account: payload });
  } catch (err) {
    console.error("login Error:", err);
    return res.status(500).json({ error: "Lỗi server", detail: err.message });
  }
};

const register = async (req, res) => {
  console.log("register called", req.body);

  try {
    const { FullName, Phone, Email, Password, PasswordHash } = req.body;
    const fullName = (FullName || "").trim();
    const phone = (Phone || "").trim();
    const email = (Email || "").trim();
    const rawPassword = (Password || "").trim();
    let passwordHash = (PasswordHash || "").trim();

    if (!fullName || !phone || !email) {
      return res.status(400).json({
        error: "FullName, Phone va Email la bat buoc",
      });
    }

    if (!passwordHash && !rawPassword) {
      return res.status(400).json({
        error: "Password hoac PasswordHash la bat buoc",
      });
    }

    if (!passwordHash) {
      passwordHash = rawPassword;
    }

    await sql.query`
      EXEC sp_RegisterCustomer
        @FullName=${fullName},
        @Phone=${phone},
        @Email=${email},
        @PasswordHash=${passwordHash}
    `;

    return res.status(201).json({
      message: "Dang ky tai khoan thanh cong",
      data: {
        FullName: fullName,
        Phone: phone,
        Email: email,
      },
    });
  } catch (err) {
    console.error("register Error:", err);

    if (isRegisterBusinessError(err.message)) {
      return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: "Loi server", detail: err.message });
  }
};

module.exports = { login, register };
