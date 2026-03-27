using DAL;
using Microsoft.Extensions.Configuration;
using Models;
using System.Collections.Generic;
using System.Data;

namespace BLL
{
    public class QuanLyLoaiPhong_BLL
    {
        private readonly QuanLyLoaiPhong_DAL qllp_dal;

        public QuanLyLoaiPhong_BLL(IConfiguration configuration)
        {
            qllp_dal = new QuanLyLoaiPhong_DAL(configuration);
        }

        public List<RoomTypes> LayTatCa()
        {
            var list = qllp_dal.GetAll();
            return (list == null || list.Count == 0) ? new List<RoomTypes>() : list;
        }

        public DataTable ThemMoi(RoomTypes lp)
        {
            return qllp_dal.Insert(lp);
        }
    }
}
