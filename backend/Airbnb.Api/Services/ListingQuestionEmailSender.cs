using System.Net;
using System.Net.Mail;

namespace Airbnb.API.Services;

public sealed class ListingQuestionEmailSender(
    IConfiguration configuration,
    ILogger<ListingQuestionEmailSender> logger)
{
    public async Task<bool> SendAsync(
        string ownerEmail,
        string listingTitle,
        string senderName,
        string senderEmail,
        string message,
        CancellationToken cancellationToken)
    {
        var host = configuration["Email:Smtp:Host"];
        var fromAddress = configuration["Email:Smtp:FromAddress"];
        if (string.IsNullOrWhiteSpace(host) ||
            string.IsNullOrWhiteSpace(fromAddress) ||
            !int.TryParse(configuration["Email:Smtp:Port"], out var port) ||
            port is < 1 or > 65535)
        {
            logger.LogWarning("Listing question email was not sent because SMTP is not configured.");
            return false;
        }

        var username = configuration["Email:Smtp:Username"];
        var password = configuration["Email:Smtp:Password"];
        var fromName = configuration["Email:Smtp:FromName"] ?? "HomeFU";

        try
        {
            using var mail = new MailMessage
            {
                From = new MailAddress(fromAddress, fromName),
                Subject = $"New question about: {listingTitle}",
                Body = $"You received a question about your listing \"{listingTitle}\".\n\n" +
                    $"From: {senderName} ({senderEmail})\n\n{message}\n\n" +
                    "Reply to this email to contact the guest.",
                IsBodyHtml = false
            };
            mail.To.Add(new MailAddress(ownerEmail));
            mail.ReplyToList.Add(new MailAddress(senderEmail, senderName));

            using var client = new SmtpClient(host, port)
            {
                EnableSsl = configuration.GetValue("Email:Smtp:EnableSsl", true),
                UseDefaultCredentials = false,
                Timeout = 15000
            };
            if (!string.IsNullOrWhiteSpace(username))
                client.Credentials = new NetworkCredential(username, password ?? string.Empty);

            await client.SendMailAsync(mail, cancellationToken);
            return true;
        }
        catch (Exception exception) when (exception is SmtpException or FormatException or ArgumentException)
        {
            logger.LogError(exception, "Could not send listing question email for {ListingTitle}.", listingTitle);
            return false;
        }
    }
}
