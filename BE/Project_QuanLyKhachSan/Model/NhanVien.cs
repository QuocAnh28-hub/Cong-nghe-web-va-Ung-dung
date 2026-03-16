using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class NhanVien
    {
        public string EMAIL { get; set; }
        public string PASSWORDHASH { get; set; }
        public string FULLNAME { get; set; }
        public string ROLE { get; set; }
        public string PHONE { get; set; }
    }
}
