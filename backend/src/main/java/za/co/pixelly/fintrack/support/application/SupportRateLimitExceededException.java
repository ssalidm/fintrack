package za.co.pixelly.fintrack.support.application;

public class SupportRateLimitExceededException
    extends RuntimeException {

    private final long retryAfterSeconds;


    public SupportRateLimitExceededException(
        long retryAfterSeconds
    ) {
        super("Too many support requests");

        this.retryAfterSeconds = retryAfterSeconds;
    }


    public long retryAfterSeconds() {
        return retryAfterSeconds;
    }
}
