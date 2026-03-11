using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class Invoices
    {
        public int INVOICEID { get; set; }
        public int STAYID { get; set; }
        public DateTime ISSUEDATE { get; set; }
        public decimal TOTALAMOUNT { get; set; }
        public decimal VAT { get; set; }
        public string STATUS { get; set; }
    }
}