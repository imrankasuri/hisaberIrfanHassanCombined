namespace HisaberAccountServer.Models
{
    public class OpeningBal
    {
        public int ID { get; set; }
        public int AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string AccountCode { get; set; } = string.Empty;
        public int CompanyId { get; set; }
        public decimal DRAmt { get; set; }
        public decimal CRAmt { get; set; }
        public int FYear { get; set; }
        public DateTime OpeningDate { get; set; } = DateTime.Now;
        public string? ModifyBy { get; set; }
        public DateTime ModifyDate { get; set; } = DateTime.Now;
        public decimal BudgetAllocation { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }

}
