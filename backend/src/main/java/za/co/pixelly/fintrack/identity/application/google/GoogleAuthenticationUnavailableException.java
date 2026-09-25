package za.co.pixelly.fintrack.identity.application.google;

public class GoogleAuthenticationUnavailableException extends RuntimeException {

    public GoogleAuthenticationUnavailableException() {
        super("Google authentication is not configured");
    }
}
