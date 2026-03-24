using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace DAL
{
    public class QuanLyNhanVien_DAL
    {
        private readonly DatabaseHelper _dbHelper;
        private readonly DataBase_Connect _dbcn;

        public QuanLyNhanVien_DAL(IConfiguration configuration)
        {
            _dbHelper = new DatabaseHelper(configuration);
            _dbcn = new DataBase_Connect(configuration);
        }

        // ===== Lấy tất cả nhân viên
        public List<NhanVien> GetAll()
        {
            try
            {
                var list = new List<NhanVien>();
                string sql = "EXEC GetUserReceptionistInfo";
                var dt = _dbHelper.ExecuteQuery(sql);

                foreach (DataRow r in dt.Rows)
                {
                    list.Add(new NhanVien
                    {
                        FULLNAME = r["FULLNAME"]?.ToString()?.Trim(),
                        ROLE = r["ROLE"]?.ToString()?.Trim(),
                        EMAIL = r["EMAIL"]?.ToString()?.Trim(),
                        PHONE = r["PHONE"]?.ToString()?.Trim(),
                        CREATEDAT = r["CREATEDAT"] != DBNull.Value ? Convert.ToDateTime(r["CREATEDAT"]) : DateTime.MinValue
                    });
                }
                return list;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi lấy danh sách nhân viên: " + ex.Message);
            }
        }

        public DataTable Insert(NhanVien nv)
        {
            try
            {
                SqlParameter[] p =
                    {
                        new SqlParameter("@Email",   nv.EMAIL),
                        new SqlParameter("@PasswordHash",  nv.PASSWORDHASH),
                        new SqlParameter("@FullName",    nv.FULLNAME),
                        new SqlParameter("@Role", nv.ROLE),
                        new SqlParameter("@Phone", nv.PHONE)
                    };
                DataTable dt = _dbcn.GetDataTableFromSP("sp_CreateReceptionist", p);
                return dt;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi thêm: " + ex.Message);
            }
        }
    }
}
