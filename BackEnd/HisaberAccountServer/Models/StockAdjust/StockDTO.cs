namespace HisaberAccountServer.Models.StockAdjust
{
    public class StockDTO
    {
        public StockAdjustHead? StockHead { get; set; }
        public List<StockAdjustBody>? StockBody { get; set; }
    }
}
