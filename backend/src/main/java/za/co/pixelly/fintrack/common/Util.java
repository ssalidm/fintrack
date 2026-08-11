package za.co.pixelly.fintrack.common;

import java.util.Locale;

public final class Util {

    private Util() {}

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
