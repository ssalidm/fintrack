package za.co.pixelly.fintrack.identity.application.google;

public class InvalidGoogleCredentialException extends RuntimeException {

    public InvalidGoogleCredentialException() {
        super("Google authentication failed");
    }
}
