using System.ComponentModel.DataAnnotations;

namespace HisaberAccountServer.Models.Settings
{
    public class OTPSent
    {
        public int ID { get; set; }
        public string MemberID { get; set; }
        public string EmailAddress { get; set; }
        public string TransactionType { get; set; }
        public string OTP { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}
