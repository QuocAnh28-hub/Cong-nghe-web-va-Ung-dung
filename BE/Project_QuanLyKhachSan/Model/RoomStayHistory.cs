using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class RoomStayHistorys
    {
        public int ID { get; set; }
        public int STAYID { get; set; }
        public int ROOMID { get; set; }
        public DateTime CHECKINTIME { get; set; }
        public DateTime CHECKOUTTIME { get; set; }
        public decimal RATEATTHATTIME { get; set; }
    }
}