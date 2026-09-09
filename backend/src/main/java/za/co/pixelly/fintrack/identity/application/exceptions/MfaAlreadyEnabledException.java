package za.co.pixelly.fintrack.identity.application.exceptions;

public class MfaAlreadyEnabledException extends RuntimeException {

    public MfaAlreadyEnabledException() {
        super("Two-factor authentication is already enabled");
    }
}
