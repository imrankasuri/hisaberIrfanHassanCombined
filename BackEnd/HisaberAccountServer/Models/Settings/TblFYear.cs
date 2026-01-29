using System.ComponentModel.DataAnnotations;

namespace HisaberAccountServer.Models.Settings
{
    public class TblFYear
    {

        public int ID { get; set; }
        public int CompanyID { get; set; }
        public int FYear { get; set; }
        public string FYearDescription { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}
