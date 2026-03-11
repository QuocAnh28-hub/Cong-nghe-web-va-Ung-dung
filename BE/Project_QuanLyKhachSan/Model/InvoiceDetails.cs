using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class InvoiceDetails
    {
        public int DETAILID { get; set; }
        public int INVOICEID { get; set; }
        public string ITEMTYPE { get; set; }
        public string ITEMNAME { get; set; }
        public int QUANTITY { get; set; }
        public decimal UNITPRICE { get; set; }
        public decimal AMOUNT { get; set; }
    }
}