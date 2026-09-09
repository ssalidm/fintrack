package za.co.pixelly.fintrack.identity.application.exceptions;

public class MfaNotEnabledException
    extends RuntimeException {

    public MfaNotEnabledException() {
        super("Two-factor authentication is not enabled");
    }
}
