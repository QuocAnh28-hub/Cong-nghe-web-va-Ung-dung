using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
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
                string sql = "SELECT COUNT(*) AS SoLuong FROM Users WHERE UserID = @MATAIKHOAN";
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
                    SELECT TOP 1 UserID, Email, PasswordHash, Role, CreatedAt
                    FROM Users
                    WHERE Email = @USERNAME AND PasswordHash = @PASS";

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
                        USERID = Convert.ToInt32(r["UserID"]),
                        EMAIL = r["Email"].ToString().Trim(),
                        PASSWORDHASH = r["PasswordHash"].ToString().Trim(),
                        ROLE = r["Role"].ToString().Trim(),
                        CREATEDAT = r["CreatedAt"] == DBNull.Value ? DateTime.MinValue : Convert.ToDateTime(r["CreatedAt"])
                    });
                }

                return list;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi đăng nhập: " + ex.Message);
            }
        }

        public string GetRoleByUsername(string username)
        {
            try
            {
                string sql = "SELECT TOP 1 Role FROM Users WHERE UserID = @USERNAME";
                SqlParameter[] p =
                {
                    new SqlParameter("@USERNAME", username)
                };

                DataTable dt = _dbHelper.ExecuteQuery(sql, p);
                if (dt.Rows.Count > 0)
                    return dt.Rows[0]["Role"].ToString();

                return "";
            }
            catch (Exception)
            {
                return "";
            }
        }
    }
}
