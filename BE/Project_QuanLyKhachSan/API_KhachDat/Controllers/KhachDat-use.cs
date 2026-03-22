using BLL;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace API_KhachDat.Controllers
{
    [EnableCors("AllowLocalDev")]
    [Route("api/KhachDat")]
    [ApiController]
    public class KhachDat_use : Controller
    {
        private readonly KhachDat_BLL _bll;

        public KhachDat_use(IConfiguration configuration)
        {
            _bll = new KhachDat_BLL(configuration);
        }

        [HttpPost("Register")]
        public IActionResult Register([FromBody] DangKyTaiKhoan dk)
        {
            try
            {

                _bll.DangKy(dk);
                return Ok(new { success = true, message = "Đăng ký tài khoản thành công" });

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi: " + ex.Message });
            }
        }
    }
}
