namespace HisaberAccountServer.Models
{
    public class Pictures
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string UserID { get; set; }
        public byte[] ImageData { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}
