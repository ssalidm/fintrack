package za.co.pixelly.fintrack.identity.application.exceptions;

public class UserProfileConflictException extends RuntimeException {

    public UserProfileConflictException(String message) {
        super(message);
    }
}
