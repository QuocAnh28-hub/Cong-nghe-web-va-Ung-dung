using Microsoft.AspNetCore.Mvc;

namespace API_KhachDat.Controllers
{
    public class KhachDat_use : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
