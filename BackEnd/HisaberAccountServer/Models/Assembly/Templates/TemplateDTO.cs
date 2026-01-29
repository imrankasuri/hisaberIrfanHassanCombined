namespace HisaberAccountServer.Models.Assembly.Templates
{
    public class TemplateDTO
    {
        public Details? TempDetails { get; set; }
        public List<FinishedGoods>? FinishedGoods { get; set; }
        public List<RawMaterial>? RawMaterials { get; set; }
        public List<NonStock>? NonStocks { get; set; }
        public List<Expenses>? Expenses { get; set; }
    }
}