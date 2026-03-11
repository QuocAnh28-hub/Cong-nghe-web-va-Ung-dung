using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class Stays
    {
        public int STAYID { get; set; }
        public int RESERVATIONID { get; set; }
        public int GUESTID { get; set; }
        public DateTime ACTUALCHECKIN { get; set; }
        public DateTime ACTUALCHECKOUT { get; set; }
        public string STATUS { get; set; }
    }
}
