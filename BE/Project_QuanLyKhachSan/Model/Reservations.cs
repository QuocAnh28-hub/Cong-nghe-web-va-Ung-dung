using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class Reservations
    {
        public int RESERVATIONID { get; set; }
        public int CUSTOMERID { get; set; }
        public DateTime CHECKINDATE { get; set; }
        public DateTime CHECKOUTDATE { get; set; }
        public string STATUS { get; set; }
        public DateTime CREATEDAT { get; set; }
    }
}