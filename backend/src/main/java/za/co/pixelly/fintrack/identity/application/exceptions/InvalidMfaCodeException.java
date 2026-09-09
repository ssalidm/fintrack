package za.co.pixelly.fintrack.identity.application.exceptions;

public class InvalidMfaCodeException extends RuntimeException {

    public InvalidMfaCodeException() {
        super("Invalid authenticator code");
    }
}
