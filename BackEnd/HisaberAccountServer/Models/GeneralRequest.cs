using Microsoft.AspNetCore.Components.Web;

namespace HisaberAccountServer.Models
{
    public class GeneralRequest
    {
        public static string GetHtmlcontent(string title, string data, string email, string code)
        {
            string response = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <link href='https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap' rel='stylesheet'>
                    <style>
                        body {{
                            font-family: 'Work Sans', sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f9f9f9;
                            color: #333;
                            font-weight: normal;
                        }}
                        .container {{
                            width: 100%;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            box-sizing: border-box;
                        }}
                        .content {{
                            background-color: #ffffff;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            overflow: hidden;
                            margin: 20px 0;
                        }}
                        .header {{
                            padding: 40px 20px;
                            background-color: #003399;
                            color: #ffffff;
                            text-align: center;
                        }}
                        .header h1 {{
                            margin: 0;
                            font-size: 24px;
                        }}
                        .main {{
                            padding: 30px 20px;
                            text-align: center;
                            font-weight: normal;
                        }}
                        .main h2 {{
                            margin-top: 0;
                            font-size: 20px;
                            font-weight: 600;
                            text-align: center;
                        }}
                        .main p {{
                            font-size: 16px;
                            line-height: 1.5;
                            font-weight: normal;
                        }}
                        .footer {{
                            text-align: center;
                            padding: 20px;
                            background-color: #E5EAF5;
                            font-size: 14px;
                            color: #555;
                        }}
                        .footer h3 {{
                            margin: 0;
                            font-size: 16px;
                            font-weight: normal;
                        }}
                        .footer div {{
                            margin-top: 10px;
                        }}
                        .btn {{
                            display: inline-block;
                            padding: 10px 20px;
                            background-color: #003399;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 4px;
                            margin-top: 20px;
                            font-size: 16px;
                        }}
                        @media (max-width: 600px) {{
                            .header h1 {{
                                font-size: 20px;
                            }}
                            .main h2 {{
                                font-size: 18px;
                            }}
                            .main p {{
                                font-size: 14px;
                            }}
                        }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='content'>
                            <div class='header'>
                                THANKS FOR SIGNING UP! <br/><h1>{title}</h1>
                            </div>
                            <div class='main'>
                                <h2>Hi {email},</h2>
                                <p>You're almost ready to get started. Please click on the button below to verify your email address and enjoy exclusive cleaning services with us!</p>
                                <br/>
                                <div>{data}: <b>{code}</b></div>
                            </div>
                            <div class='footer'>
                                <h3>Contact us: noreply@hisaaber.com</h3>
                                <div>Thanks,<br/>The Company Team</div>
                            </div>
                            <div class='footer' style='background-color: #003399; color: #ffffff; padding: 10px 20px;'>
                                Copyrights © Company All Rights Reserved
                            </div>
                        </div>
                    </div>
                </body>
                </html>";

            return response;
        }

        public string? Email { get; set; }
        public string? UserID { get; set; }
        public int CompanyID { get; set; }
        public string? AccountCode { get; set; }
        public string? AccountName { get; set; }
        public string? OrderBy { get; set; }
        public long BillID { get; set; }
        public long InvoiceNo { get; set; }
        public int Level1 { get; set; }
        public int Level2 { get; set; }
        public string? Type { get; set; }
        public string? DocNo { get; set; }
        public int ID { get; set; }
        public DateOnly? Date { get; set; }
        public int PageSize { get; set; }
        public int PageNo { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string? ProductName { get; set; }
        public Boolean InComplete { get; set; }
        public Boolean ExcludeZero { get; set; }
    }
}
