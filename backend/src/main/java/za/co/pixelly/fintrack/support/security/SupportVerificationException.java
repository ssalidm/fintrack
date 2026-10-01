package za.co.pixelly.fintrack.support.security;

public class SupportVerificationException extends RuntimeException {

    public SupportVerificationException() {
        super("We could not verify this request. Please try again.");
    }
}
