const { sql } = require("../config/db");

const extractSqlErrorMessage = (err) => {
  return (
    err?.originalError?.info?.message ||
    err?.precedingErrors?.[0]?.message ||
    err?.message ||
    "Loi server"
  );
};

const getCustomersFullInfo = async (req, res) => {
  console.log("getCustomersFullInfo called");
  try {
    const result = await sql.query`EXEC sp_GetCustomersFullInfo`;
    return res.json(result.recordset || []);
  } catch (err) {
    console.error("getCustomersFullInfo Error:", err);
    return res.status(500).json({ error: "Loi server", detail: err.message });
  }
};

const insertCustomer = async (req, res) => {
  console.log("insertCustomer called", req.body);
  try {
    const { FullName, Phone, CCCD, Email } = req.body;

    if (!FullName || !Phone || !CCCD || !Email) {
      return res.status(400).json({
        error: "Thieu tham so bat buoc: FullName, Phone, CCCD, Email",
      });
    }

    await sql.query`
      EXEC sp_Customers_Insert
        @FullName=${FullName},
        @Phone=${Phone},
        @CCCD=${CCCD},
        @Email=${Email}
    `;

    return res.status(201).json({ message: "Them customer thanh cong" });
  } catch (err) {
    console.error("insertCustomer Error:", err);
    const message = extractSqlErrorMessage(err);
    return res.status(400).json({ error: message });
  }
};

const updateCustomer = async (req, res) => {
  console.log("updateCustomer called", req.params, req.body);
  try {
    const customerID = Number.parseInt(req.params.id, 10);
    const { FullName, Phone, CCCD, Email } = req.body;

    if (
      !Number.isInteger(customerID) ||
      customerID <= 0 ||
      !FullName ||
      !Phone ||
      !CCCD ||
      !Email
    ) {
      return res.status(400).json({
        error: "Du lieu khong hop le. Can id, FullName, Phone, CCCD, Email",
      });
    }

    await sql.query`
      EXEC sp_Customers_Update
        @CustomerID=${customerID},
        @FullName=${FullName},
        @Phone=${Phone},
        @CCCD=${CCCD},
        @Email=${Email}
    `;

    return res.json({ message: "Cap nhat customer thanh cong" });
  } catch (err) {
    console.error("updateCustomer Error:", err);
    const message = extractSqlErrorMessage(err);
    return res.status(400).json({ error: message });
  }
};

module.exports = {
  getCustomersFullInfo,
  insertCustomer,
  updateCustomer,
};