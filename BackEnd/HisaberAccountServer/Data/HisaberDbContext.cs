using HisaberAccountServer.Models;
using HisaberAccountServer.Models.Accounts;
using HisaberAccountServer.Models.Assembly.Templates;
using HisaberAccountServer.Models.Bank;
using HisaberAccountServer.Models.Company;
using HisaberAccountServer.Models.Products;
using HisaberAccountServer.Models.Purchase;
using HisaberAccountServer.Models.Sales;
using HisaberAccountServer.Models.Settings;
using HisaberAccountServer.Models.StockAdjust;
using HisaberAccountServer.Models.Views;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;

namespace HisaberAccountServer.Data
{
    public class HisaberDbContext : IdentityDbContext<ApplicationUser>
    {
        public HisaberDbContext(DbContextOptions options) : base(options)
        {
        }
        public DbSet<CompanyInfo> tblCompanyInfo { get; set; }
        public DbSet<EmailLog> tblEmailLog { get; set; }
        public DbSet<DefaultAccount> tblDefaultAccount { get; set; }
        public DbSet<AccountMain> AccountMain { get; set; }
        public DbSet<TblFYear> tblFYear { get; set; }
        public DbSet<OTPSent> tblOTPSent { get; set; }
        public DbSet<Pictures> tblPictures { get; set; }
        public DbSet<OpeningBal> tblOpeningBal { get; set; }
        public DbSet<Invitation> tblInvitation { get; set; }
        public DbSet<UserCompanyRole> tblUserCompanyRoles { get; set; }
        public DbSet<Logo> tblLogo { get; set; }
        public DbSet<Product> tblProducts { get; set; }
        public DbSet<DefaultProducts> tblDefaultProducts { get; set; }
        public DbSet<DropdownData> tblDropdownData { get; set; }
        public DbSet<CustomerSupplier> tblCustomerSupplier { get; set; }
        public DbSet<SaleHead> tblSaleHead { get; set; }
        public DbSet<PurchaseHead> tblPurchaseHead { get; set; }
        public DbSet<PurchaseBody> tblPurchaseBody { get; set; }
        public DbSet<ReceiptHead> tblReceiptHead { get; set; }
        public DbSet<SaleBody> tblSaleBody { get; set; }
        public DbSet<ReceiptBody> tblReceiptBody { get; set; }
        public DbSet<PaymentBody> tblPaymentBody { get; set; }
        public DbSet<PaymentHead> tblPaymentHead { get; set; }
        public DbSet<BankPayments> tblBankPayments { get; set; }
        public DbSet<BankReceipts> tblBankReceipts { get; set; }
        public DbSet<StockAdjustHead> tblStockAdjustHead { get; set; }
        public DbSet<StockAdjustBody> tblStockAdjustBody { get; set; }
        public DbSet<BankTransfers> tblBankTransfers { get; set; }
        public DbSet<JournalVoucher> tblJournalVoucher { get; set; }
        public DbSet<Details> tblDetails { get; set; }
        public DbSet<FinishedGoods> tblFinishedGoods { get; set; }
        public DbSet<RawMaterial> tblRawMaterials { get; set; }
        public DbSet<NonStock> tblNonStock { get; set; }
        public DbSet<Expenses> tblExpenses { get; set; }
        public DbSet<Location> tblLocations { get; set; }
        public DbSet<LoginLog> tblLoginLog { get; set; }
        public DbSet<vwDetailFinishedGoods> vwDetailFinishedGoods { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Additional model configuration goes here

            builder.Entity<vwDetailFinishedGoods>(entity =>
            {
                entity.HasNoKey();
                entity.ToView("vwDetailFinishedGoods");
            });

            builder.Entity<UserCompanyRole>()
            .HasIndex(ucr => new { ucr.UserId, ucr.CompanyId, ucr.RoleId })
            .IsUnique();


            builder.Entity<CompanyInfo>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.UserId).IsRequired().HasMaxLength(450);
                entity.Property(e => e.CompanyCode).IsRequired().HasMaxLength(10);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(300);
                entity.Property(e => e.Address).IsRequired().HasMaxLength(300);
                entity.Property(e => e.Phone).IsRequired();
                entity.Property(e => e.Fax).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Phone).IsRequired();
                entity.Property(e => e.Website).IsRequired().HasMaxLength(50);
                entity.Property(e => e.LogoLogin).IsRequired().HasMaxLength(500);
                entity.Property(e => e.LogoTitle).IsRequired().HasMaxLength(500);
                entity.Property(e => e.LogoReports).IsRequired().HasMaxLength(500);
                entity.Property(e => e.PackageName).IsRequired().HasMaxLength(500);
                entity.Property(e => e.PackageExpiry).IsRequired().HasColumnType("DATE");
                entity.Property(e => e.NTN).IsRequired().HasMaxLength(300);
                entity.Property(e => e.Currency).IsRequired().HasMaxLength(300);
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasColumnType("DATETIME");
                entity.Property(e => e.UpdatedDate).HasColumnType("DATETIME");

            });

            builder.Entity<EmailLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.EmailTo).IsRequired().HasMaxLength(100);
                entity.Property(e => e.EmailFrom).HasMaxLength(100);
                entity.Property(e => e.Subject).HasMaxLength(100);
                entity.Property(e => e.Reference).HasMaxLength(100);
                entity.Property(e => e.EventType).HasMaxLength(50);
                entity.Property(e => e.DeliveryStatus).HasMaxLength(50);
                entity.Property(e => e.SendDate).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).IsRequired();
                entity.Property(e => e.IsDeleted).IsRequired();

            });

            builder.Entity<DefaultAccount>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.AccountCode).IsRequired().HasMaxLength(50);
                entity.Property(e => e.AccountDescription).HasMaxLength(500);
                entity.Property(e => e.ILevel).IsRequired();
                entity.Property(e => e.Remarks).HasMaxLength(2500);
            });

            builder.Entity<AccountMain>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CompanyId).IsRequired();
                entity.Property(e => e.AccountCode).IsRequired().HasMaxLength(50);
                entity.Property(e => e.AccountDescription).HasMaxLength(500);
                entity.Property(e => e.ILevel).IsRequired();
                entity.Property(e => e.Remarks).HasMaxLength(2500);
                entity.Property(e => e.Year).IsRequired();
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).IsRequired();
                entity.Property(e => e.IsDeleted).IsRequired();

            });

            builder.Entity<TblFYear>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.FYear).IsRequired();
                entity.Property(e => e.FYearDescription).HasMaxLength(50);
                entity.Property(e => e.StartDate).HasDefaultValueSql("DATEFROMPARTS(YEAR(GETDATE()), 1, 1)");
                entity.Property(e => e.EndDate).HasDefaultValueSql("DATEFROMPARTS(YEAR(GETDATE()), 12, 31)");
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.IsActive).IsRequired();
                entity.Property(e => e.IsDeleted).IsRequired();

            });

            builder.Entity<OTPSent>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.MemberID).IsRequired().HasMaxLength(450);
                entity.Property(e => e.EmailAddress).IsRequired().HasMaxLength(500);
                entity.Property(e => e.TransactionType).IsRequired().HasMaxLength(20);
                entity.Property(e => e.OTP).IsRequired().HasMaxLength(10);
                entity.Property(e => e.ExpiryDate).HasColumnType("DATETIME");
                entity.Property(e => e.CreatedDate)
                    .HasDefaultValueSql("GETDATE()")
                    .ValueGeneratedOnAdd();
                entity.Property(e => e.IsActive).IsRequired();
                entity.Property(e => e.IsDeleted).IsRequired();
            });

            builder.Entity<Pictures>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.ImageData).IsRequired();
                entity.Property(e => e.CreatedDate)
                    .HasDefaultValueSql("GETDATE()")
                    .ValueGeneratedOnAdd();
                entity.Property(e => e.IsActive).IsRequired();
                entity.Property(e => e.UserID).IsRequired().HasMaxLength(450);
                entity.Property(e => e.IsDeleted).IsRequired();
            });

            builder.Entity<OpeningBal>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.AccountId).IsRequired();
                entity.Property(e => e.AccountCode).IsRequired();
                entity.Property(e => e.AccountName).IsRequired();
                entity.Property(e => e.CompanyId).IsRequired();
                entity.Property(e => e.DRAmt).HasColumnType("decimal(18,2)");
                entity.Property(e => e.CRAmt).HasColumnType("decimal(18,2)");
                entity.Property(e => e.FYear);
                entity.Property(e => e.ModifyDate)
                   .HasDefaultValueSql("GETDATE()")
                   .ValueGeneratedOnAdd();
                entity.Property(e => e.ModifyBy).IsRequired().HasMaxLength(450);
                entity.Property(e => e.BudgetAllocation).HasColumnType("decimal(18,2)");
                entity.Property(e => e.CreatedDate)
                    .HasDefaultValueSql("GETDATE()")
                    .ValueGeneratedOnAdd();
                entity.Property(e => e.CreatedDate)
                    .HasDefaultValueSql("GETDATE()")
                    .ValueGeneratedOnAdd();
                entity.Property(e => e.IsActive).IsRequired();
                entity.Property(e => e.IsDeleted).IsRequired();
            });

            builder.Entity<Invitation>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.FromUserID).IsRequired().HasMaxLength(450);
                entity.Property(e => e.FromUserCompanyID).IsRequired();
                entity.Property(e => e.ToEmail).IsRequired().HasMaxLength(500);
                entity.Property(e => e.InviteCode).IsRequired().HasMaxLength(50);
                entity.Property(e => e.InviteStatus).IsRequired().HasMaxLength(20);
                entity.Property(e => e.CreatedDate)
                    .HasDefaultValueSql("GETDATE()")
                    .ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate)
                    .HasDefaultValueSql("GETDATE()")
                    .ValueGeneratedOnAdd();
                entity.Property(e => e.IsActive).IsRequired();
                entity.Property(e => e.IsDeleted).IsRequired();
                entity.Property(e => e.InvitedRole).IsRequired().HasMaxLength(250);
            });

            builder.Entity<Logo>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CompanyId).IsRequired();
                entity.Property(e => e.LogoName).IsRequired().HasMaxLength(450);
                entity.Property(e => e.LogoData).IsRequired();
                entity.Property(e => e.LogoType).IsRequired().HasMaxLength(255);
                entity.Property(e => e.IsActive).IsRequired();
                entity.Property(e => e.IsDeleted).IsRequired();
                entity.Property(e => e.CreatedDate)
                    .HasDefaultValueSql("GETDATE()")
                    .ValueGeneratedOnAdd();
            });

            builder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(450);
                entity.Property(e => e.Type).HasMaxLength(450);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.OpeningQuantity).HasColumnType("decimal(18,2)");
                entity.Property(e => e.BaseOpeningQuantity).HasColumnType("decimal(18,2)");
                entity.Property(e => e.OpeningRate).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Code).IsRequired();
                entity.Property(e => e.StockAssetAccount).HasMaxLength(255);
                entity.Property(e => e.LowStockLevel).HasMaxLength(20);
                entity.Property(e => e.Category).HasMaxLength(255);
                entity.Property(e => e.IncomeAccount).HasMaxLength(255);
                entity.Property(e => e.SalePrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SaleInformation).HasColumnType("text");
                entity.Property(e => e.ExpenseAccount).HasMaxLength(255);
                entity.Property(e => e.Cost).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SaleDiscount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.PurchaseDiscount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Weight).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Unit).HasMaxLength(255);
                entity.Property(e => e.Notes).HasColumnType("text");
                entity.Property(e => e.GSTRate).HasColumnType("text");
                entity.Property(e => e.NonFilerGSTRate).HasColumnType("text");
                entity.Property(e => e.MaxRRExTax).HasColumnType("decimal(18,2)");
                entity.Property(e => e.MaxRRIncTax).HasColumnType("decimal(18,2)");
                entity.Property(e => e.BinLocation).HasMaxLength(255);
                entity.Property(e => e.LargePackSize).HasMaxLength(20);
                entity.Property(e => e.SmallPackSize).HasMaxLength(20);
                entity.Property(e => e.PrefferedSupplier).HasMaxLength(255);
                entity.Property(e => e.Field1).HasColumnType("text");
                entity.Property(e => e.Field2).HasColumnType("text");
                entity.Property(e => e.Field3).HasColumnType("text");
                entity.Property(e => e.Field4).HasColumnType("text");
                entity.Property(e => e.FieldA).HasColumnType("text");
                entity.Property(e => e.FieldB).HasColumnType("text");
                entity.Property(e => e.FieldC).HasColumnType("text");
                entity.Property(e => e.FieldD).HasColumnType("text");
                entity.Property(e => e.DefaultUnit).HasMaxLength(255);
                entity.Property(e => e.CategoryCode).HasMaxLength(255);
                entity.Property(e => e.ProductType).HasColumnType("text");
                entity.Property(e => e.Size).HasMaxLength(255);
                entity.Property(e => e.OpeningWeight).HasColumnType("decimal(18,2)");
                entity.Property(e => e.OpeningLength).HasColumnType("decimal(18,2)");
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });

            builder.Entity<DefaultProducts>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(450);
                entity.Property(e => e.Code).IsRequired();
                entity.Property(e => e.CategoryCode).HasMaxLength(255);
                entity.Property(e => e.ProductType).HasColumnType("text");
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });

            builder.Entity<DropdownData>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Name).HasMaxLength(255);
                entity.Property(e => e.Type);
                entity.Property(e => e.ShortName);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive).IsRequired();
                entity.Property(e => e.IsDeleted).IsRequired();
                entity.Property(e => e.CreatedDate)
                    .HasDefaultValueSql("GETDATE()")
                    .ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate)
                    .HasDefaultValueSql("GETDATE()")
                    .ValueGeneratedOnAdd();
            });

            builder.Entity<CustomerSupplier>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.AccountCode).IsRequired().HasMaxLength(10);
                entity.Property(e => e.BusinessName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Title).HasMaxLength(10);
                entity.Property(e => e.FirstName).HasMaxLength(100);
                entity.Property(e => e.LastName).HasMaxLength(100);
                entity.Property(e => e.AccountNo).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Email).HasMaxLength(255);
                entity.Property(e => e.Mobile).HasMaxLength(30);
                entity.Property(e => e.Phone).HasMaxLength(30);
                entity.Property(e => e.Website).HasMaxLength(255);
                entity.Property(e => e.BillingAddress).HasMaxLength(255);
                entity.Property(e => e.City).HasMaxLength(255);
                entity.Property(e => e.Country).HasMaxLength(255);
                entity.Property(e => e.ShippingAddress).HasMaxLength(500);
                entity.Property(e => e.ShippingCountry).HasMaxLength(200);
                entity.Property(e => e.ShippingProvince).HasMaxLength(200);
                entity.Property(e => e.ShippingCity).HasMaxLength(200);
                entity.Property(e => e.ShippingPostalCode).HasMaxLength(20);
                entity.Property(e => e.BankName).HasMaxLength(500);
                entity.Property(e => e.AccountName).HasMaxLength(500);
                entity.Property(e => e.AccountNumber).HasMaxLength(500);
                entity.Property(e => e.IBANNumber).HasMaxLength(500);
                entity.Property(e => e.SwiftCode).HasMaxLength(30);
                entity.Property(e => e.Address).HasMaxLength(1000);
                entity.Property(e => e.Province).HasMaxLength(255);
                entity.Property(e => e.PostalCode).HasMaxLength(15);
                entity.Property(e => e.NTNNumber).HasMaxLength(255);
                entity.Property(e => e.CNIC).HasMaxLength(20);
                entity.Property(e => e.SalesTaxNumber).HasMaxLength(255);
                entity.Property(e => e.PayementTermDays).HasMaxLength(20);
                entity.Property(e => e.CreditLimit).HasColumnType("decimal(18,2)");
                entity.Property(e => e.OpeningDate).HasColumnType("DATE");
                entity.Property(e => e.SMSMobile).HasMaxLength(25);
                entity.Property(e => e.WhatsAppMobile).HasMaxLength(25);
                entity.Property(e => e.CustomerOpeningBalance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SupplierOpeningBalance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.CustomerBaseOpeningBalance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SupplierBaseOpeningBalance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Groups).HasMaxLength(255);
                entity.Property(e => e.Notes).HasMaxLength(255);
                entity.Property(e => e.Field1).HasMaxLength(255);
                entity.Property(e => e.Field2).HasMaxLength(255);
                entity.Property(e => e.Field3).HasMaxLength(255);
                entity.Property(e => e.Field4).HasMaxLength(255);
                entity.Property(e => e.FieldA).HasMaxLength(255);
                entity.Property(e => e.FieldB).HasMaxLength(255);
                entity.Property(e => e.FieldC).HasMaxLength(255);
                entity.Property(e => e.FieldD).HasMaxLength(255);
                entity.Property(e => e.Extra1).HasMaxLength(255);
                entity.Property(e => e.Extra2).HasMaxLength(255);
                entity.Property(e => e.Discount).IsRequired().HasColumnType("decimal(18,2)");
                entity.Property(e => e.IsSupplier);
                entity.Property(e => e.IsFiler);
                entity.Property(e => e.IsCustomer);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });

            builder.Entity<SaleHead>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(450);
                entity.Property(e => e.CustomerAccountCode).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Address).HasMaxLength(450);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.TermDays).HasMaxLength(20);
                entity.Property(e => e.DueDate).HasColumnType("DATE");
                entity.Property(e => e.DocNo);
                entity.Property(e => e.CreditLimit).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Balance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AdjustedBalance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SubTotal).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalDiscount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalSaleTax).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Total).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Notes).HasColumnType("text");
                entity.Property(e => e.Field1).HasColumnType("text");
                entity.Property(e => e.Field2).HasColumnType("text");
                entity.Property(e => e.InComplete);
                entity.Property(e => e.OverallDiscount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SaleBy).HasMaxLength(255);
                entity.Property(e => e.InvoiceNo).HasColumnType("bigint");
                entity.Property(e => e.SaleType).IsRequired().HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });

            builder.Entity<SaleBody>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Product).IsRequired().HasMaxLength(255);
                entity.Property(e => e.ProductID);
                entity.Property(e => e.Description).HasMaxLength(255);
                entity.Property(e => e.Unit).HasMaxLength(255);
                entity.Property(e => e.Quantity).HasMaxLength(20);
                entity.Property(e => e.Rate).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.DiscPercentege).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Discount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TaxRate).HasMaxLength(255);
                entity.Property(e => e.SaleTax).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Net).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Field1).HasColumnType("text");
                entity.Property(e => e.DefaultUnit).HasMaxLength(255);
                entity.Property(e => e.Weight).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Length).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SaleBy).HasMaxLength(255);
                entity.Property(e => e.InvoiceNo).IsRequired();
                entity.Property(e => e.SaleType).IsRequired().HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.Complete);
                entity.Property(e => e.InComplete);
            });

            builder.Entity<PurchaseHead>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.SupplierName).IsRequired().HasMaxLength(450);
                entity.Property(e => e.SupplierAccountCode).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Address).HasMaxLength(450);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.TermDays).HasMaxLength(20);
                entity.Property(e => e.DueDate).HasColumnType("DATE");
                entity.Property(e => e.BillID);
                entity.Property(e => e.BillNumber).HasMaxLength(255);
                entity.Property(e => e.CreditLimit).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Balance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AdjustedBalance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SubTotal).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalDiscount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalSaleTax).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Total).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Notes).HasColumnType("text");
                entity.Property(e => e.Field1).HasColumnType("text");
                entity.Property(e => e.Field2).HasColumnType("text");
                entity.Property(e => e.Field3).HasColumnType("text");
                entity.Property(e => e.Field4).HasColumnType("text");
                entity.Property(e => e.PurchaseBy).HasMaxLength(255);
                entity.Property(e => e.InComplete);
                entity.Property(e => e.PurchaseType).IsRequired().HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });

            builder.Entity<PurchaseBody>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Product).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Description).HasMaxLength(255);
                entity.Property(e => e.Unit).HasMaxLength(255);
                entity.Property(e => e.Quantity).HasMaxLength(20);
                entity.Property(e => e.Rate).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.DiscPercentege).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Discount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TaxRate).HasMaxLength(255);
                entity.Property(e => e.SaleTax).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Net).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Field1).HasColumnType("text");
                entity.Property(e => e.DefaultUnit).HasMaxLength(255);
                entity.Property(e => e.Weight).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Length).HasColumnType("decimal(18,2)");
                entity.Property(e => e.PurchaseBy).HasMaxLength(255);
                entity.Property(e => e.BillID).IsRequired();
                entity.Property(e => e.PurchaseType).IsRequired().HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.InComplete);
            });

            builder.Entity<ReceiptHead>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(450);
                entity.Property(e => e.CustomerAccountCode).IsRequired().HasMaxLength(255);
                entity.Property(e => e.MailingAddress).HasMaxLength(450);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.RefNo);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.WHTRate).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AdditionalWHT).HasColumnType("decimal(18,2)");
                entity.Property(e => e.UnAllocatedBalance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Bank).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Mode).IsRequired().HasMaxLength(255);
                entity.Property(e => e.TotalDiscount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalOpenBalance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalReceipt).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalWHT).HasColumnType("decimal(18,2)");
                entity.Property(e => e.OverallDiscount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Total).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Notes).HasColumnType("text");
                entity.Property(e => e.Field1).HasColumnType("text");
                entity.Property(e => e.Field2).HasColumnType("text");
                entity.Property(e => e.InvoiceNo);
                entity.Property(e => e.InComplete);
                entity.Property(e => e.ReceiptBy).HasMaxLength(255);
                entity.Property(e => e.VoucherNo).HasColumnType("bigint");
                entity.Property(e => e.ReceiptType).IsRequired().HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });

            builder.Entity<ReceiptBody>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.DocNo).HasMaxLength(255);
                entity.Property(e => e.DueDate).HasColumnType("DATE");
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.OpenBalance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Discount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.WHTRate).HasColumnType("decimal(18,2)");
                entity.Property(e => e.WHT).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Receipt).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Total).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ReceiptBy).HasMaxLength(255);
                entity.Property(e => e.InvoiceNo).IsRequired();
                entity.Property(e => e.ReceiptType).IsRequired().HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.VoucherNo);
                entity.Property(e => e.VoucherID);
                entity.Property(e => e.InComplete);
            });

            builder.Entity<PaymentHead>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.SupplierName).IsRequired().HasMaxLength(450);
                entity.Property(e => e.SupplierAccountCode).IsRequired().HasMaxLength(255);
                entity.Property(e => e.MailingAddress).HasMaxLength(450);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.RefNo);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.WHTRate).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AdditionalWHT).HasColumnType("decimal(18,2)");
                entity.Property(e => e.UnAllocatedBalance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Bank).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Mode).IsRequired().HasMaxLength(255);
                entity.Property(e => e.TotalDiscount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalOpenBalance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalPayment).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalWHT).HasColumnType("decimal(18,2)");
                entity.Property(e => e.OverallDiscount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Total).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Notes).HasColumnType("text");
                entity.Property(e => e.Field1).HasColumnType("text");
                entity.Property(e => e.Field2).HasColumnType("text");
                entity.Property(e => e.InComplete);
                entity.Property(e => e.BillID);
                entity.Property(e => e.PurchaseBy).HasMaxLength(255);
                entity.Property(e => e.VoucherNo).HasColumnType("bigint");
                entity.Property(e => e.PurchaseType).IsRequired().HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });

            builder.Entity<PaymentBody>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.BillNo).HasMaxLength(255);
                entity.Property(e => e.DueDate).HasColumnType("DATE");
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.OpenBalance).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Discount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.WHTRate).HasColumnType("decimal(18,2)");
                entity.Property(e => e.WHT).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Payment).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Total).HasColumnType("decimal(18,2)");
                entity.Property(e => e.PurchaseBy).HasMaxLength(255);
                entity.Property(e => e.BillID).IsRequired();
                entity.Property(e => e.PurchaseType).IsRequired().HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.VoucherNo);
                entity.Property(e => e.VoucherID);
                entity.Property(e => e.InComplete);
            });

            builder.Entity<BankPayments>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.RefNo).HasMaxLength(255);
                entity.Property(e => e.Mode).HasMaxLength(255);
                entity.Property(e => e.NominalAccount).HasMaxLength(255);
                entity.Property(e => e.Detail).HasMaxLength(255);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.BankPaymentType).HasMaxLength(255);
                entity.Property(e => e.BankPaymentBy).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Field1).HasColumnType("text");
                entity.Property(e => e.Field2).HasColumnType("text");
                entity.Property(e => e.Field3).HasColumnType("text");
                entity.Property(e => e.Bank).HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.BankPayment);
                entity.Property(e => e.WHTPayment);
                entity.Property(e => e.BankReceipt);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.VoucherNo);
            });

            builder.Entity<BankReceipts>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.RefNo).HasMaxLength(255);
                entity.Property(e => e.Mode).HasMaxLength(255);
                entity.Property(e => e.NominalAccount).HasMaxLength(255);
                entity.Property(e => e.Detail).HasMaxLength(255);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.BankReceiptBy).HasMaxLength(255);
                entity.Property(e => e.BankReceiptType).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Field1).HasColumnType("text");
                entity.Property(e => e.Field2).HasColumnType("text");
                entity.Property(e => e.Field3).HasColumnType("text");
                entity.Property(e => e.Bank).HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.BankReceipt);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.VoucherNo);
            });

            builder.Entity<StockAdjustHead>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.InvoiceNo).HasColumnType("bigint");
                entity.Property(e => e.NominalAccount).HasMaxLength(450);
                entity.Property(e => e.DocNo);
                entity.Property(e => e.Total).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AdjustType).IsRequired().HasMaxLength(255);
                entity.Property(e => e.AdjustBy).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Notes).HasColumnType("text");
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.Extra1).HasColumnType("text");
                entity.Property(e => e.Extra2).HasColumnType("text");
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });

            builder.Entity<StockAdjustBody>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.InvoiceNo).HasColumnType("bigint");
                entity.Property(e => e.ProductName).HasMaxLength(450);
                entity.Property(e => e.Description).HasMaxLength(450);
                entity.Property(e => e.Unit).HasMaxLength(255);
                entity.Property(e => e.Quantity).HasMaxLength(20);
                entity.Property(e => e.Weight).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Length).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Rate).HasColumnType("decimal(18,2)");
                entity.Property(e => e.DefaultUnit).HasMaxLength(255);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AdjustType).IsRequired().HasMaxLength(255);
                entity.Property(e => e.AdjustBy).IsRequired().HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.Extra1).HasColumnType("text");
                entity.Property(e => e.Extra2).HasColumnType("text");
                entity.Property(e => e.ProductCode);
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });

            builder.Entity<BankTransfers>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.RefNo).HasMaxLength(255);
                entity.Property(e => e.Mode).HasMaxLength(255);
                entity.Property(e => e.Detail).HasMaxLength(255);
                entity.Property(e => e.FromBank).HasMaxLength(255);
                entity.Property(e => e.ToBank).HasMaxLength(255);
                entity.Property(e => e.FromBankCode).HasMaxLength(255);
                entity.Property(e => e.ToBankCode).HasMaxLength(255);
                entity.Property(e => e.BankTransferBy).HasMaxLength(255);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Field1).HasColumnType("text");
                entity.Property(e => e.Field2).HasColumnType("text");
                entity.Property(e => e.Field3).HasColumnType("text");
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.VoucherNo);
            });

            builder.Entity<JournalVoucher>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.RefNo).HasMaxLength(255);
                entity.Property(e => e.Mode).HasMaxLength(255);
                entity.Property(e => e.Detail).HasMaxLength(255);
                entity.Property(e => e.FromAccount).HasMaxLength(255);
                entity.Property(e => e.ToAccount).HasMaxLength(255);
                entity.Property(e => e.FromAccountCode).HasMaxLength(255);
                entity.Property(e => e.ToAccountCode).HasMaxLength(255);
                entity.Property(e => e.JournalVoucherBy).HasMaxLength(255);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Field1).HasColumnType("text");
                entity.Property(e => e.Field2).HasColumnType("text");
                entity.Property(e => e.Field3).HasColumnType("text");
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive);
                entity.Property(e => e.IsDeleted);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.VoucherNo);
            });

            builder.Entity<Details>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.TemplateName).HasMaxLength(255);
                entity.Property(e => e.CostCalType).HasMaxLength(255);
                entity.Property(e => e.RMFactor).HasMaxLength(255);
                entity.Property(e => e.StartDate);
                entity.Property(e => e.FinishedDate);
                entity.Property(e => e.RefNo).HasMaxLength(255);
                entity.Property(e => e.Status).HasMaxLength(255);
                entity.Property(e => e.Location).HasMaxLength(255);
                entity.Property(e => e.LocationCode).HasMaxLength(255);
                entity.Property(e => e.LocationID);
                entity.Property(e => e.Notes).HasMaxLength(255);
                entity.Property(e => e.AssemblyType).HasMaxLength(255);
                entity.Property(e => e.Extra1).HasMaxLength(255);
                entity.Property(e => e.Extra2).HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.UserID).HasMaxLength(255);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.IsDeleted).HasDefaultValue(false);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });

            builder.Entity<FinishedGoods>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ReferenceID);
                entity.Property(e => e.ProductName).HasMaxLength(255);
                entity.Property(e => e.ProductCode).HasColumnType("bigInt");
                entity.Property(e => e.ProductID);
                entity.Property(e => e.Description).HasMaxLength(255);
                entity.Property(e => e.QTYFI).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Unit).HasMaxLength(255);
                entity.Property(e => e.Quantity);
                entity.Property(e => e.CostFI).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AssemblyType).HasMaxLength(255);
                entity.Property(e => e.Extra1).HasMaxLength(255);
                entity.Property(e => e.Extra2).HasMaxLength(255);
                entity.Property(e => e.UserID).HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.IsDeleted).HasDefaultValue(false);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });

            builder.Entity<RawMaterial>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ReferenceID);
                entity.Property(e => e.ProductName).HasMaxLength(255);
                entity.Property(e => e.ProductID);
                entity.Property(e => e.ProductCode).HasColumnType("bigInt");
                entity.Property(e => e.Description).HasMaxLength(255);
                entity.Property(e => e.Location).HasMaxLength(255);
                entity.Property(e => e.LocationCode).HasMaxLength(255);
                entity.Property(e => e.LocationID);
                entity.Property(e => e.Unit).HasMaxLength(255);
                entity.Property(e => e.StockInHand);
                entity.Property(e => e.PerUnit);
                entity.Property(e => e.QTYRequired).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AssemblyType).HasMaxLength(255);
                entity.Property(e => e.Extra1).HasMaxLength(255);
                entity.Property(e => e.Extra2).HasMaxLength(255);
                entity.Property(e => e.UserID).HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.IsDeleted).HasDefaultValue(false);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });
            builder.Entity<NonStock>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ReferenceID);
                entity.Property(e => e.ProductName).HasMaxLength(255);
                entity.Property(e => e.ProductID);
                entity.Property(e => e.ProductCode).HasColumnType("bigInt");
                entity.Property(e => e.Details).HasMaxLength(255);
                entity.Property(e => e.QuantityPerUnit).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Rate).HasColumnType("decimal(18,2)");
                entity.Property(e => e.QTYRequired).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AssemblyType).HasMaxLength(255);
                entity.Property(e => e.Extra1).HasMaxLength(255);
                entity.Property(e => e.Extra2).HasMaxLength(255);
                entity.Property(e => e.UserID).HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.IsDeleted).HasDefaultValue(false);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });
            builder.Entity<Expenses>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ReferenceID);
                entity.Property(e => e.ExpenseAccount).HasMaxLength(255);
                entity.Property(e => e.ExpenseAccountID);
                entity.Property(e => e.Details).HasMaxLength(255);
                entity.Property(e => e.Rate).HasColumnType("decimal(18,2)");
                entity.Property(e => e.QTYRequired).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AssemblyType).HasMaxLength(255);
                entity.Property(e => e.Extra1).HasMaxLength(255);
                entity.Property(e => e.Extra2).HasMaxLength(255);
                entity.Property(e => e.UserID).HasMaxLength(255);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.IsDeleted).HasDefaultValue(false);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });

            builder.Entity<Location>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.CompanyID).IsRequired();
                entity.Property(e => e.LocationName).HasMaxLength(255);
                entity.Property(e => e.LocationCode).HasMaxLength(255);
                entity.Property(e => e.Details).HasMaxLength(255);
                entity.Property(e => e.Extra1).HasMaxLength(255);
                entity.Property(e => e.Extra2).HasMaxLength(255);
                entity.Property(e => e.UserID).HasMaxLength(255);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.IsDeleted).HasDefaultValue(false);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });

            builder.Entity<LoginLog>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.UserID).HasMaxLength(255);
                entity.Property(e => e.Password).HasMaxLength(255);
                entity.Property(e => e.Date).HasColumnType("DATE");
                entity.Property(e => e.UserType).HasMaxLength(255);
                entity.Property(e => e.IPAddress).HasMaxLength(255);
                entity.Property(e => e.IsSuccess);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.IsDeleted).HasDefaultValue(false);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
                entity.Property(e => e.UpdatedDate).HasDefaultValueSql("GETDATE()").ValueGeneratedOnAdd();
            });
        }
    }
}
