using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class Rates
    {
        public int RATEID { get; set; }
        public int ROOMTYPEID { get; set; }
        public decimal PRICE { get; set; }
        public DateTime STARTDATE { get; set; }
        public DateTime ENDDATE { get; set; }
        public string SEASON { get; set; }
    }
}