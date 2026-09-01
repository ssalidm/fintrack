package za.co.pixelly.fintrack.identity.application.exceptions;

public class InvalidTimeZoneException extends RuntimeException {

    public InvalidTimeZoneException(String timeZone) {
        super("Invalid time zone: " + timeZone);
    }
}
