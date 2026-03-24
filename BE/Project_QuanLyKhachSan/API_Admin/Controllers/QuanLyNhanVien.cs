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


namespace API_Admin.Controllers
{
    [Authorize]
    [Route("api/QuanLyNhanVien")]
    [ApiController]
    public class QuanLyNhanVien : Controller
    {
        private readonly QuanLyNhanVien_BLL _bll;

        public QuanLyNhanVien(IConfiguration configuration)
        {
            _bll = new QuanLyNhanVien_BLL(configuration);
        }

        [HttpGet("get-all-nhanvien")]
        public IActionResult GetAllNhanVien()
        {
            try
            {
                var data = _bll.LayTatCa()
                    .Select(x => new
                    {
                        FULLNAME = x.FULLNAME?.Trim(),
                        ROLE = x.ROLE?.Trim(),
                        EMAIL = x.EMAIL?.Trim(),
                        PHONE = x.PHONE?.Trim(),
                        CREATEDAT = x.CREATEDAT
                    })
                    .ToList();

                return Ok(new { success = true, message = "Lấy danh sách nhân viên thành công", data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi: " + ex.Message });
            }
        }

        [HttpPost("create-nhanvien")]
        public IActionResult CreateNhanVien([FromBody] NhanVien nv)
        {
            try
            {
                
                _bll.ThemMoi(nv);
                return Ok(new { success = true, message = "Thêm thông tin nhân viên thành công" });
                
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi: " + ex.Message });
            }
        }
    }
}

