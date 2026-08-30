package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import za.co.pixelly.fintrack.common.validation.constraints.ValidTimeZone;

public record UpdateUserProfileRequest(

    @NotNull
    Long version,

    @Size(max = 100)
    String firstName,

    @Size(max = 100)
    String lastName,

    @Size(max = 64)
    @ValidTimeZone(message = "Must be a valid IANA time zone ID (e.g., Africa/Johannesburg)")
    String timeZone

) {

    @AssertTrue(message = "firstName must not be blank when provided")
    public boolean isFirstNameValid() {
        return firstName == null || !firstName.isBlank();
    }

    @AssertTrue(message = "lastName must not be blank when provided")
    public boolean isLastNameValid() {
        return lastName == null || !lastName.isBlank();
    }

    @AssertTrue(message = "timeZone must not be blank when provided")
    public boolean isTimeZoneValid() {
        return timeZone == null || !timeZone.isBlank();
    }

    @AssertTrue(message = "At least one profile field must be provided")
    public boolean isUpdateProvided() {
        return firstName != null || lastName != null || timeZone != null;
    }
}
