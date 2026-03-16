using BLL;
using Microsoft.AspNetCore.Authorization;
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


namespace API_LeTan.Controllers
{
    [Authorize]
    [Route("api/QuanLyLoaiPhong")]
    [ApiController]
    public class QuanLyLoaiPhong : Controller
    {
        private readonly QuanLyLoaiPhong_BLL _bll;

        public QuanLyLoaiPhong(IConfiguration configuration)
        {
            _bll = new QuanLyLoaiPhong_BLL(configuration);
        }

        [HttpPost("create-loaiphong")]
        public IActionResult CreateLoaiPhong([FromBody] RoomTypes rt)
        {
            try
            {

                _bll.ThemMoi(rt);
                return Ok(new { success = true, message = "Thêm thông tin loại phòng thành công" });

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi: " + ex.Message });
            }
        }
    }
}

