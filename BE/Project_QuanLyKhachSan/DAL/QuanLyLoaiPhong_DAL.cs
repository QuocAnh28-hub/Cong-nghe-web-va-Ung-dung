using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace DAL
{
    public class QuanLyLoaiPhong_DAL
    {
        private readonly DatabaseHelper _dbHelper;
        private readonly DataBase_Connect _dbcn;

        public QuanLyLoaiPhong_DAL(IConfiguration configuration)
        {
            _dbHelper = new DatabaseHelper(configuration);
            _dbcn = new DataBase_Connect(configuration);
        }

        public DataTable Insert(RoomTypes rt)
        {
            try
            {
                SqlParameter[] p =
                    {
                        new SqlParameter("@Name",   rt.NAME),
                        new SqlParameter("@Description",  rt.DESCRIPTION),
                        new SqlParameter("@Capacity",    rt.CAPACITY),
                        new SqlParameter("@DefaultPrice", rt.DEFAULTPRICE)
                    };
                DataTable dt = _dbcn.GetDataTableFromSP("sp_CreateRoomType", p);
                return dt;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi thêm: " + ex.Message);
            }
        }
    }
}
