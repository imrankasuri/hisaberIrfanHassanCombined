namespace HisaberAccountServer.Models.Assembly.Templates
{
    public class Details
    {
        public int ID { get; set; }
        public int CompanyID { get; set; }
        public string? TemplateName { get; set; }
        public int? RMFactor { get; set; }
        public string? CostCalType { get; set; }
        public DateOnly? StartDate { get; set; }
        public string? RefNo { get; set; }
        public string? Location { get; set; }
        public string? Status { get; set; }
        public DateOnly? FinishedDate { get; set; }
        public string? LocationCode { get; set; }
        public int? LocationID { get; set; }
        public string AssemblyType { get; set; }
        public string? Notes { get; set; }
        public string? Extra1 { get; set; }
        public string? Extra2 { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string? UserID { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }

    }
}
