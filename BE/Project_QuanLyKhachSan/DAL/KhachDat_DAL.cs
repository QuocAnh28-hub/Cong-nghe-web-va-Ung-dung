using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Configuration;
using Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace DAL
{
    public class KhachDat_DAL
    {
        private readonly DatabaseHelper _dbHelper;
        private readonly DataBase_Connect _dbcn;

        public KhachDat_DAL(IConfiguration configuration)
        {
            _dbHelper = new DatabaseHelper(configuration);
            _dbcn = new DataBase_Connect(configuration);
        }
        
        public DataTable Register(DangKyTaiKhoan dk)
        {
            try
            {
                SqlParameter[] p =
                    {
                        new SqlParameter("@FullName",    dk.FULLNAME),
                        new SqlParameter("@Phone", dk.PHONE),
                        new SqlParameter("@Email", dk.EMAIL),
                        new SqlParameter("@PasswordHash",  dk.PASSWORDHASH)
                    };
                DataTable dt = _dbcn.GetDataTableFromSP("sp_RegisterCustomer", p);
                return dt;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi thêm: " + ex.Message);
            }
        }
    }
}
