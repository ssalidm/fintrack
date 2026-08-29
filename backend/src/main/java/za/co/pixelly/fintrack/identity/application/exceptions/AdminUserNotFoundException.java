package za.co.pixelly.fintrack.identity.application.exceptions;

public class AdminUserNotFoundException extends RuntimeException {

    public AdminUserNotFoundException() {
        super("User not found");
    }
}
