using DAL;
using Microsoft.Extensions.Configuration;
using Models;
using System.Collections.Generic;
using System.Data;

namespace BLL
{
    public class KhachDat_BLL
    {
        private readonly KhachDat_DAL kd_dal;

        public KhachDat_BLL(IConfiguration configuration)
        {
            kd_dal = new KhachDat_DAL(configuration);
        }

        // Đăng ký tài khoản từ khách hàng
        public DataTable DangKy(DangKyTaiKhoan dk)
        {
            return kd_dal.Register(dk);
        }
    }
}
