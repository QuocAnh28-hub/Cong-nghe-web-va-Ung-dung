using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class ServiceUsages
    {
        public int USAGEID { get; set; }
        public int STAYID { get; set; }
        public int SERVICEID { get; set; }
        public int QUANTITY { get; set; }
        public DateTime USEDDATE { get; set; }
    }
}
