namespace HisaberAccountServer.Models.Assembly.Templates
{
    public class CopyTemplateRequest
    {
        public int SourceTemplateID { get; set; }
        public int CompanyID { get; set; }
        public string UserID { get; set; }
        public string? NewTemplateName { get; set; }
        public int? NewProductID { get; set; }
    }
}
