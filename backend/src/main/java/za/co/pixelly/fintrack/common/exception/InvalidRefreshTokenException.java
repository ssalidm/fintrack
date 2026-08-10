package za.co.pixelly.fintrack.common.exception;

public class InvalidRefreshTokenException extends RuntimeException {
    public InvalidRefreshTokenException() {
        super("Refresh token invalid or expired");
    }
}
