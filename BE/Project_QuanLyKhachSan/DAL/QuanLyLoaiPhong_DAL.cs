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

        public List<RoomTypes> GetAll()
        {
            try
            {
                var list = new List<RoomTypes>();
                string sql = "select * from RoomTypes";
                var dt = _dbHelper.ExecuteQuery(sql);

                foreach (DataRow r in dt.Rows)
                {
                    list.Add(new RoomTypes
                    {
                        ROOMTYPEID = r["ROOMTYPEID"] == DBNull.Value ? 0 : Convert.ToInt32(r["ROOMTYPEID"]),
                        NAME = r["NAME"]?.ToString()?.Trim(),
                        DESCRIPTION = r["DESCRIPTION"]?.ToString()?.Trim(),
                        CAPACITY = r["CAPACITY"] == DBNull.Value ? 0 : Convert.ToInt32(r["CAPACITY"]),
                        DEFAULTPRICE = r["DEFAULTPRICE"] == DBNull.Value ? 0 : Convert.ToDecimal(r["DEFAULTPRICE"])
                    });
                }
                return list;
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi lấy danh sách nhân viên: " + ex.Message);
            }
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
