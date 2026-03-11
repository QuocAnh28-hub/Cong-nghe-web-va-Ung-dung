namespace Models
{
    public class TaiKhoan
    {
        public int USERID { get; set; }
        public string EMAIL { get; set; }
        public string PASSWORDHASH { get; set; }
        public string ROLE { get; set; }
        public DateTime CREATEDAT { get; set; }
    }
}
