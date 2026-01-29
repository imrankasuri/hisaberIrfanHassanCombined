namespace HisaberAccountServer.Models.Settings
{
    public class Invitation
    {
        public int ID { get; set; }
        public string FromUserID { get; set; }
        public int FromUserCompanyID { get; set; }
        public string ToEmail { get; set; }
        public string InviteCode { get; set; }
        public string InviteStatus { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string InvitedRole { get; set; }
    }
}
