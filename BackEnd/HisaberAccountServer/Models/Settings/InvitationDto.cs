namespace HisaberAccountServer.Models.Settings
{
    public class InvitationDto
    {
        public string FromUserID { get; set; }
        public int FromUserCompanyID { get; set; }
        public string ToEmail { get; set; }
        public string InvitedRole { get; set; }
    }
}
