namespace HisaberAccountServer.Models.Products
{
    public class DefaultProducts
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public long Code { get; set; }
        public string ProductType { get; set; }
        public string CategoryCode { get; set; }
        public int CompanyID { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
    }
}
