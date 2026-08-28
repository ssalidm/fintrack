package za.co.pixelly.fintrack.identity.application.exceptions;

public class InvalidPasswordResetTokenException
    extends RuntimeException {

    public InvalidPasswordResetTokenException() {
        super("Password reset token is invalid or expired");
    }
}
