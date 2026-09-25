package za.co.pixelly.fintrack.identity.application;

import java.util.Locale;

public final class EmailAddressNormalizer {

    private EmailAddressNormalizer() {
    }

    public static String normalize(
        String email
    ) {
        return email
            .trim()
            .toLowerCase(Locale.ROOT);
    }
}
