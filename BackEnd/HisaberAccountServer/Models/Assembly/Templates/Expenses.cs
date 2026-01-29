namespace HisaberAccountServer.Models.Assembly.Templates
{
    public class Expenses
    {
        public int ID { get; set; }
        public int CompanyID { get; set; }
        public int ReferenceID { get; set; }
        public string? ExpenseAccount { get; set; }
        public int? ExpenseAccountID { get; set; }
        public string? Details { get; set; }
        public decimal? Rate { get; set; }
        public decimal? QTYRequired { get; set; }
        public decimal? Amount { get; set; }
        public string AssemblyType { get; set; }
        public string? Extra1 { get; set; }
        public string? Extra2 { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string? UserID { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}
