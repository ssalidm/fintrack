package za.co.pixelly.fintrack.common;

import java.time.Instant;
import java.util.Locale;

public final class Util {

    private Util() {
    }

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public static String normalizeNullable(String value) {
        if (value == null) return null;
        return value.trim().isEmpty() ? null : value.trim();
    }

    public static Instant now() {
        return Instant.now();
    }
}
