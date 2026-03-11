using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace DAL
{
    public class TaiKhoan_DAL
    {
        private readonly DatabaseHelper _dbHelper;

        public TaiKhoan_DAL(IConfiguration configuration)
        {
            _dbHelper = new DatabaseHelper(configuration);
        }

        // ===== Helpers =====
        public bool KiemTraTonTai(string maTK)
        {
            try
            {
                string sql = "SELECT COUNT(*) AS SoLuong FROM TAIKHOAN WHERE MATAIKHOAN = @MATAIKHOAN";
                SqlParameter[] p = { new SqlParameter("@MATAIKHOAN", maTK) };
                var dt = _dbHelper.ExecuteQuery(sql, p);
                if (dt.Rows.Count > 0)
                {
                    int count = Convert.ToInt32(dt.Rows[0]["SoLuong"]);
                    return count > 0;
                }
                return false;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi kiểm tra tồn tại tài khoản: " + ex.Message);
            }
        }

        // ===== LOGIN =====
        // Trả về 0 hoặc 1 bản ghi phù hợp với username/password
        public List<TaiKhoan> Login(string username, string password)
        {
            try
            {
                var list = new List<TaiKhoan>();
                string sql = @"
                    SELECT TOP 1 MATAIKHOAN, USERNAME, PASS, QUYEN
                    FROM TAIKHOAN
                    WHERE USERNAME = @USERNAME AND PASS = @PASS";

                SqlParameter[] p =
                {
                    new SqlParameter("@USERNAME", username),
                    new SqlParameter("@PASS", password)
                };

                DataTable dt = _dbHelper.ExecuteQuery(sql, p);
                foreach (DataRow r in dt.Rows)
                {
                    list.Add(new TaiKhoan
                    {
                        MATAIKHOAN = r["MATAIKHOAN"].ToString().Trim(),
                        USERNAME = r["USERNAME"].ToString().Trim(),
                        PASS = r["PASS"].ToString().Trim(),
                        QUYEN = r["QUYEN"] == DBNull.Value ? 0 : Convert.ToInt32(r["QUYEN"])
                    });
                }

                return list;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi đăng nhập: " + ex.Message);
            }
        }

        public int GetRoleByUsername(string username)
        {
            try
            {
                string sql = "SELECT TOP 1 QUYEN FROM TAIKHOAN WHERE USERNAME = @USERNAME";
                SqlParameter[] p =
                {
                    new SqlParameter("@USERNAME", username)
                };

                DataTable dt = _dbHelper.ExecuteQuery(sql, p);
                if (dt.Rows.Count > 0)
                    return Convert.ToInt32(dt.Rows[0]["QUYEN"]);

                return 0;
            }
            catch (Exception)
            {
                return 0;
            }
        }
    }
}
