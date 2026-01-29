namespace HisaberAccountServer.Models.Accounts
{
    public class AccountMain
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountDescription { get; set; } = string.Empty;
        public int ILevel { get; set; }
        public string Remarks { get; set; } = string.Empty;
        public int Year { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }

        public List<AccountMain>? Level2Accounts { get; set; }
        public List<AccountMain>? Level3Accounts { get; set; }
    }
}
