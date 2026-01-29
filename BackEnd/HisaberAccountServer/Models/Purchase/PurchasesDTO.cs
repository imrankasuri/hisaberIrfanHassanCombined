using HisaberAccountServer.Models.Bank;

namespace HisaberAccountServer.Models.Purchase
{
    public class PurchasesDTO
    {
        public PurchaseHead? PurchaseHead { get; set; }
        public List<PurchaseBody>? PurchaseBody { get; set; }
        public PaymentHead? PaymentHead { get; set; }
        public List<PaymentBody>? PaymentBody { get; set; }
        public List<PaymentHead>? ListOfPaymentHead { get; set; }
        public List<BankPayments>? ExpenseData { get; set; }
    }
}
