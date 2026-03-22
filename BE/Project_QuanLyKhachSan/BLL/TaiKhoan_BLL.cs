using DAL;
using Microsoft.Extensions.Configuration;
using Models;
using System.Collections.Generic;
using System.Data;

namespace BLL
{
    public class TaiKhoan_BLL
    {
        private readonly TaiKhoan_DAL tk_dal;

        public TaiKhoan_BLL(IConfiguration configuration)
        {
            tk_dal = new TaiKhoan_DAL(configuration);
        }

        // Đăng nhập
        public List<Login> DangNhap(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                return new List<Login>();

            return tk_dal.Login(username, password);
        }

        // Lấy quyền theo username
        public string LayQuyen(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return "";

            return tk_dal.GetRoleByUsername(username);
        }
    }
}
