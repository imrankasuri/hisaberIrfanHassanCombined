namespace HisaberAccountServer.Models.Settings
{
    public class EmailLog
    {
        public int Id { get; set; }
        public string EmailTo { get; set; }
        public string EmailFrom { get; set; }
        public string Subject { get; set; }
        public string Reference { get; set; }
        public string EventType { get; set; }
        public string DeliveryStatus { get; set; }
        public DateTime SendDate { get; set; } = DateTime.Now;
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}
