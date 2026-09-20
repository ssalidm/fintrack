package za.co.pixelly.fintrack.identity.application;

public interface RegistrationEmailSender {

    void sendRegistrationEmail(
        String email,
        String rawToken
    );
}
