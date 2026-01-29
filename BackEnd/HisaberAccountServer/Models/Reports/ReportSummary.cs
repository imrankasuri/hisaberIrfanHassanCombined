namespace HisaberAccountServer.Models.Reports
{
    public class ReportSummary
    {

        public string AccountCode { get; set; }
        public string Name { get; set; }
        public decimal? TotalDebit { get; set; }
        public decimal? TotalCredit { get; set; }
        public decimal? Balance { get; set; }
        public decimal? BaseBalance { get; set; }


    }
}
