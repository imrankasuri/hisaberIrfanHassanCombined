namespace HisaberAccountServer.Models.Settings
{
    public class LoginLog
    {
        public int ID { get; set; }
        public string UserID { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string UserType { get; set; } = null!;
        public DateOnly Date { get; set; }
        public Boolean IsSuccess { get; set; }
        public string IPAddress { get; set; } = null!;
        public int CompanyID { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}
