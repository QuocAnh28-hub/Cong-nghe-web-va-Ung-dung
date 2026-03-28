const sql = require("mssql");
require("dotenv").config();

const config = {
  server: process.env.DB_SERVER || "localhost\\SQLEXPRESS",
  database: process.env.DB_DATABASE || "QuanLyKhachSan",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "123",

  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  port: 1433
};

const connectDB = async () => {
  try {
    console.log("Connecting to DB...");
    await sql.connect(config);
    console.log("✅ Connected to SQL Server");
  } catch (err) {
    console.error("❌ DB Error:", err.message);
  }
};

module.exports = { sql, connectDB };