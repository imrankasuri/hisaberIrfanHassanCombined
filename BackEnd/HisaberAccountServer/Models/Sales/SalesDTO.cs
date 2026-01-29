namespace HisaberAccountServer.Models.Sales
{
    public class SalesDTO
    {
        public SaleHead? SaleHead { get; set; }
        public List<SaleBody>? SaleBody { get; set; }
        public ReceiptHead? ReceiptHead { get; set; }
        public List<ReceiptBody>? ReceiptBody { get; set; }
        public List<ReceiptHead>? ListOfReceiptHead { get; set; }
    }
}
