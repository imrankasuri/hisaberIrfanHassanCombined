using System.ComponentModel.DataAnnotations;

namespace HisaberAccountServer.Models.LoginSystem
{
    public class ChangePassword
    {
        public string OldPassword { get; set; }
        public string NewPassword { get; set; } = string.Empty;
        [Compare("NewPassword", ErrorMessage = "New Password and Confirm Password does not match.")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
