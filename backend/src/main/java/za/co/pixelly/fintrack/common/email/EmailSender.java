package za.co.pixelly.fintrack.common.email;

public interface EmailSender {

    void send(
        EmailMessage message
    );
}
