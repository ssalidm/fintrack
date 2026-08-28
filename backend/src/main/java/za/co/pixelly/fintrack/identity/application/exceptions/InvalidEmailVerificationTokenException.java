package za.co.pixelly.fintrack.identity.application.exceptions;

public class InvalidEmailVerificationTokenException
    extends RuntimeException {

    public InvalidEmailVerificationTokenException() {
        super(
            "Email verification token is invalid or expired"
        );
    }
}
