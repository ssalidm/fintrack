package za.co.pixelly.fintrack.identity.application.exceptions;

public class MfaSetupNotStartedException extends RuntimeException {

    public MfaSetupNotStartedException() {
        super("Two-factor authentication setup has not been started");
    }
}
