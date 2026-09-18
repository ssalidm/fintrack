package za.co.pixelly.fintrack.common.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import za.co.pixelly.fintrack.config.email.EmailProperties;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
    prefix = "fintrack.email",
    name = "enabled",
    havingValue = "true"
)
public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender mailSender;
    private final EmailProperties emailProperties;


    @Override
    public void send(EmailMessage email) {

        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = createHelper(email, message);

            // Inline logo second
            ClassPathResource logo = new ClassPathResource("email/salif-logo-green.png");

            helper.addInline(
                "salif-logo",
                logo,
                "image/png"
            );

            mailSender.send(message);

        } catch (MessagingException | UnsupportedEncodingException exception) {
            throw new IllegalStateException(
                "Failed to prepare email message",
                exception
            );
        }
    }


    private MimeMessageHelper createHelper(
        EmailMessage email,
        MimeMessage message
    ) throws MessagingException, UnsupportedEncodingException {
        MimeMessageHelper helper = new MimeMessageHelper(
            message,
            true,
            StandardCharsets.UTF_8.name()
        );

        helper.setFrom(emailProperties.from(), emailProperties.fromName());
        helper.setTo(email.recipient());
        helper.setSubject(email.subject());

        if (email.replyTo() != null
            && !email.replyTo().isBlank()) {
            helper.setReplyTo(email.replyTo());
        }

        // HTML first
        helper.setText(email.htmlBody(), true);
        return helper;
    }
}
