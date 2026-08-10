package za.co.pixelly.fintrack.common.exception;

public class InvalidEmailVerificationTokenException
    extends RuntimeException {

    public InvalidEmailVerificationTokenException() {
        super(
            "Email verification token is invalid or expired"
        );
    }
}
