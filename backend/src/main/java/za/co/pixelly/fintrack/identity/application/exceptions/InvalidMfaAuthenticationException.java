package za.co.pixelly.fintrack.identity.application.exceptions;

public class InvalidMfaAuthenticationException
    extends RuntimeException {

    public InvalidMfaAuthenticationException() {
        super("Invalid or expired two-factor authentication attempt");
    }
}
