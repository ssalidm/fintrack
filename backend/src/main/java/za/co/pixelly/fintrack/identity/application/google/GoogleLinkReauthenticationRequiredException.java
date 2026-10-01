package za.co.pixelly.fintrack.identity.application.google;

public class GoogleLinkReauthenticationRequiredException extends RuntimeException {

    public GoogleLinkReauthenticationRequiredException() {
        super("Please sign in again before linking Google");
    }
}
