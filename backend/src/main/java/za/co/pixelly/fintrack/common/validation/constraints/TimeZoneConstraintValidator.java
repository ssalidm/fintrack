package za.co.pixelly.fintrack.common.validation.constraints;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.ZoneId;
import java.util.Set;

public class TimeZoneConstraintValidator
    implements ConstraintValidator<ValidTimeZone, String> {

    private static final Set<String> AVAILABLE_ZONE_IDS = ZoneId.getAvailableZoneIds();


    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // Return true on null/blank to allow @NotBlank to control nullability separately
        if (value == null || value.isBlank()) {
            return true;
        }

        String timeZone = value.trim();

        /*
         * UTC is intentionally supported as our account default,
         * along with named region IDs (e.g. "Africa/Johannesburg").
         */
        return "UTC".equals(timeZone) || AVAILABLE_ZONE_IDS.contains(timeZone);
    }
}
