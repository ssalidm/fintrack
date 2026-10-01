package za.co.pixelly.fintrack.common.email;

public record EmailMessage(
    String recipient,
    String subject,
    String htmlBody,
    String replyTo
) {

    public EmailMessage(
        String recipient,
        String subject,
        String htmlBody
    ) {
        this(recipient, subject, htmlBody, null);
    }
}
