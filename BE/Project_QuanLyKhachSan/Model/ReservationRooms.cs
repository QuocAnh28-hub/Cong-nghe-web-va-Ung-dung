using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class ReservationRooms
    {
        public int ID { get; set; }
        public int RESERVATIONID { get; set; }
        public int ROOMTYPEID { get; set; }
        public int QUANTITY { get; set; }
        public decimal PRICEATBOOKING { get; set; }
    }
}