package za.co.pixelly.fintrack.identity.application.exceptions;

public class InvalidRegistrationTokenException extends RuntimeException {

    public InvalidRegistrationTokenException() {
        super("Registration link is invalid or expired");
    }
}
