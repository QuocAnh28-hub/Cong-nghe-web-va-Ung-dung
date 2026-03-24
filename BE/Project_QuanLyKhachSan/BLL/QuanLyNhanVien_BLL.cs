using DAL;
using Microsoft.Extensions.Configuration;
using Models;
using System.Collections.Generic;
using System.Data;

namespace BLL
{
    public class QuanLyNhanVien_BLL
    {
        private readonly QuanLyNhanVien_DAL qlnv_dal;

        public QuanLyNhanVien_BLL(IConfiguration configuration)
        {
            qlnv_dal = new QuanLyNhanVien_DAL(configuration);
        }

        public List<NhanVien> LayTatCa()
        {
            var list = qlnv_dal.GetAll();
            return (list == null || list.Count == 0) ? new List<NhanVien>() : list;
        }

        public DataTable ThemMoi(NhanVien nv)
        {
            return qlnv_dal.Insert(nv);
        }
    }
}
