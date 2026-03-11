using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BLL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using Models;


namespace API_Common.Controllers
{
    [Route("api/Login")]
    [ApiController]
    public class Login_Controller : ControllerBase
    {
        private readonly TaiKhoan_BLL _bll;
        private readonly IConfiguration _config;

        public Login_Controller(IConfiguration configuration)
        {
            _bll = new TaiKhoan_BLL(configuration);
            _config = configuration;
        }

        // Đăng nhập và sinh Token
        [HttpPost("login")]
        public IActionResult Login(string username, string pass)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(pass))
                {
                    return Ok(new { success = false, message = "Thiếu username hoặc password!" });
                }

                var list = _bll.DangNhap(username, pass);
                if (list == null || list.Count == 0)
                {
                    return Ok(new { success = false, message = "Sai tên đăng nhập hoặc mật khẩu!" });
                }

                var user = list.First();

                //Tạo token JWT
                string token = GenerateJwtToken(user);

                return Ok(new
                {
                    success = true,
                    message = "Đăng nhập thành công!",
                    token,
                    data = new
                    {
                        USERID = user.USERID.ToString(),
                        EMAIL = user.EMAIL.Trim(),
                        ROLE = user.ROLE
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // Sinh JWT Token
        private string GenerateJwtToken(TaiKhoan user)
        {
            var jwtSettings = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.EMAIL),
                new Claim("UserID", user.USERID.ToString()),
                new Claim("Role", user.ROLE)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings["ExpiresInMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Lấy quyền theo username
        [HttpGet("get-role")]
        public IActionResult GetRole(string username)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(username))
                {
                    return Ok(new
                    {
                        success = false,
                        message = "Thiếu tên đăng nhập!"
                    });
                }

                string quyen = _bll.LayQuyen(username);

                if (quyen == null)
                {
                    return Ok(new
                    {
                        success = false,
                        message = "Không tìm thấy tài khoản hoặc chưa được cấp quyền!"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Lấy quyền thành công!",
                    data = new
                    {
                        UserName = username.Trim(),
                        Quyen = quyen
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi hệ thống: " + ex.Message
                });
            }
        }
    }
}
