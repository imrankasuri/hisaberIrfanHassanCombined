namespace HisaberAccountServer.Models
{
    public class CustomerSupplier
    {
        public int ID { get; set; }
        public int CompanyID { get; set; }
        public string? AccountCode { get; set; }
        public string? BusinessName { get; set; }
        public string? Title { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? AccountNo { get; set; }
        public string? Email { get; set; }
        public string? Mobile { get; set; }
        public string? Phone { get; set; }
        public string? Website { get; set; }
        public string? BillingAddress { get; set; }
        public string? City { get; set; }
        public string? Province { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? ShippingAddress { get; set; }
        public string? ShippingCountry { get; set; }
        public string? ShippingCity { get; set; }
        public string? ShippingProvince { get; set; }
        public string? ShippingPostalCode { get; set; }
        public string? NTNNumber { get; set; }
        public string? CNIC { get; set; }
        public string? SalesTaxNumber { get; set; }
        public int? PayementTermDays { get; set; }
        public decimal? CreditLimit { get; set; }
        public string? Notes { get; set; }
        public string? BankName { get; set; }
        public string? AccountName { get; set; }
        public string? AccountNumber { get; set; }
        public string? IBANNumber { get; set; }
        public string? SwiftCode { get; set; }
        public string? Address { get; set; }
        public DateOnly OpeningDate { get; set; }
        public decimal? CustomerBaseOpeningBalance { get; set; }
        public decimal? SupplierBaseOpeningBalance { get; set; }
        public decimal? CustomerOpeningBalance { get; set; }
        public decimal? SupplierOpeningBalance { get; set; }
        public bool IsCustomer { get; set; }
        public bool IsSupplier { get; set; }
        public decimal? Discount { get; set; }
        public bool? IsFiler { get; set; }
        public string? Groups { get; set; }
        public string? Field1 { get; set; }
        public string? Field2 { get; set; }
        public string? Field3 { get; set; }
        public string? Field4 { get; set; }
        public string? FieldA { get; set; }
        public string? FieldB { get; set; }
        public string? FieldC { get; set; }
        public string? FieldD { get; set; }
        public string? Extra1 { get; set; }
        public string? Extra2 { get; set; }
        public string? SMSMobile { get; set; }
        public string? WhatsAppMobile { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime UpdatedDate { get; set; } = DateTime.Now;

    }
}
