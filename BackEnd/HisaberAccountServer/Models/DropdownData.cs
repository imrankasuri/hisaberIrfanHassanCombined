namespace HisaberAccountServer.Models
{
    public class DropdownData
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string ShortName { get; set; }
        public int CompanyID { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
    }
}
