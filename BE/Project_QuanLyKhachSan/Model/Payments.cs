using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class Payments
    {
        public int PAYMENTID { get; set; }
        public int INVOICEID { get; set; }
        public string PAYMENTMETHOD { get; set; }
        public decimal AMOUNT { get; set; }
        public DateTime PAYMENTDATE { get; set; }
    }
}