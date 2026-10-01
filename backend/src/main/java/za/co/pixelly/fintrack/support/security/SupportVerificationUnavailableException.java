package za.co.pixelly.fintrack.support.security;

public class SupportVerificationUnavailableException extends RuntimeException {

    public SupportVerificationUnavailableException(
        Throwable cause
    ) {
        super("Request verification is temporarily unavailable", cause);
    }
}
