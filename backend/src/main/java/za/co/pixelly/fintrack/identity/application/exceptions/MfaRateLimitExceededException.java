package za.co.pixelly.fintrack.identity.application.exceptions;

public class MfaRateLimitExceededException
    extends RuntimeException {

    public MfaRateLimitExceededException() {
        super("Too many two-factor authentication attempts. Please try again later");
    }
}
