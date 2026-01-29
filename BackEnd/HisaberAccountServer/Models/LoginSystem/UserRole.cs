namespace HisaberAccountServer.Models.LoginSystem
{
    public class UserRole
    {
        public int? CompanyID { get; set; }
        public string Email { get; set; }
        public List<string> Roles { get; set; }
    }
}
