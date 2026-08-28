package za.co.pixelly.fintrack.identity.application.exceptions;

public class InvalidRefreshTokenException extends RuntimeException {
    public InvalidRefreshTokenException() {
        super("Refresh token invalid or expired");
    }
}
