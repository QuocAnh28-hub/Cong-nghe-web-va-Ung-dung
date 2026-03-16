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

        public DataTable ThemMoi(NhanVien nv)
        {
            return qlnv_dal.Insert(nv);
        }
    }
}
