namespace HisaberAccountServer.Models.Accounts
{
    public class DefaultAccount
    {
        public int ID { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountDescription { get; set; } = string.Empty;
        public int ILevel { get; set; }
        public string Remarks { get; set; } = string.Empty;
    }
}
