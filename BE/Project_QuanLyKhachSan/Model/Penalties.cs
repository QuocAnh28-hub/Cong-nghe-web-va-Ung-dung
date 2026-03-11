using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class Penalties
    {
        public int PENALTYID { get; set; }
        public int STAYID { get; set; }
        public string REASON { get; set; }
        public decimal AMOUNT { get; set; }
        public DateTime CREATEDAT { get; set; }
    }
}