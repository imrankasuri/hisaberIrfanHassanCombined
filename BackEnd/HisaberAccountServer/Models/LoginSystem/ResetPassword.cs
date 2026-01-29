using System.ComponentModel.DataAnnotations;

namespace HisaberAccountServer.Models.LoginSystem
{
    public class ResetPassword
    {
        [Required]
        public string password { get; set; }
        [Compare("password", ErrorMessage = "Password and Confirm Password does not match.")]
        public string confirmpassword { get; set; }
        public string email { get; set; }
        public string token { get; set; }
    }
}
