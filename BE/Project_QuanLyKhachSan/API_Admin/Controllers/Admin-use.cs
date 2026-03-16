using Microsoft.AspNetCore.Mvc;

namespace API_Admin.Controllers
{
    public class Admin_use : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
