using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class RoomTypes
    {
        public int ROOMTYPEID { get; set; }
        public string NAME { get; set; }
        public string DESCRIPTION { get; set; }
        public int CAPACITY { get; set; }
        public decimal DEFAULTPRICE { get; set; }
    }
}