package za.co.pixelly.fintrack.identity.application.exceptions;

public class EmailUnchangedException
    extends RuntimeException {

    public EmailUnchangedException() {
        super("New email address must be different from the current email address");
    }
}
