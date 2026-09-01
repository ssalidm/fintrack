package za.co.pixelly.fintrack.common.email;

public interface EmailSender {

    void send(
        String recipient,
        String subject,
        String body
    );
}
