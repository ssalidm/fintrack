package za.co.pixelly.fintrack.identity.application.exceptions;

public class UserProfileNotFoundException extends RuntimeException {

    public UserProfileNotFoundException() {
        super("User profile not found");
    }
}
