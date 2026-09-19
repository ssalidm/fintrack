package za.co.pixelly.fintrack.identity.application.google;

public class GoogleIdentityLinkConflictException extends RuntimeException {

    public GoogleIdentityLinkConflictException() {
        super("Google account could not be linked to this account");
    }
}
