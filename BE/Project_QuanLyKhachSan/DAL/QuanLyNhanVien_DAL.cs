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
