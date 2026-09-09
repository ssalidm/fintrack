package za.co.pixelly.fintrack.identity.application.mfa;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import za.co.pixelly.fintrack.identity.application.OpaqueTokenCodec;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class MfaRecoveryCodeCodec {

    private static final int CODE_COUNT = 10;
    private static final int CODE_LENGTH = 16;
    private static final int GROUP_SIZE = 4;

    /*
     * Excludes visually ambiguous characters:
     * 0, 1, I and O.
     */
    private static final char[] ALPHABET =
        "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
            .toCharArray();

    private final OpaqueTokenCodec tokenCodec;

    private final SecureRandom secureRandom =
        new SecureRandom();

    public List<String> generate() {
        List<String> codes =
            new ArrayList<>(CODE_COUNT);

        while (codes.size() < CODE_COUNT) {
            String code = generateOne();

            if (!codes.contains(code)) {
                codes.add(code);
            }
        }

        return List.copyOf(codes);
    }

    public String hash(String rawCode) {
        return tokenCodec.hash(
            normalize(rawCode)
        );
    }

    private String generateOne() {
        StringBuilder raw =
            new StringBuilder(CODE_LENGTH);

        for (int i = 0; i < CODE_LENGTH; i++) {
            raw.append(
                ALPHABET[
                    secureRandom.nextInt(
                        ALPHABET.length
                    )
                    ]
            );
        }

        return format(raw.toString());
    }

    private String normalize(String rawCode) {
        if (rawCode == null || rawCode.isBlank()) {
            throw new IllegalArgumentException(
                "Recovery code is required"
            );
        }

        return rawCode
            .replace("-", "")
            .replace(" ", "")
            .toUpperCase(Locale.ROOT);
    }

    private String format(String raw) {
        StringBuilder formatted =
            new StringBuilder(
                CODE_LENGTH
                    + (CODE_LENGTH / GROUP_SIZE)
                    - 1
            );

        for (int i = 0; i < raw.length(); i++) {
            if (
                i > 0
                    && i % GROUP_SIZE == 0
            ) {
                formatted.append('-');
            }

            formatted.append(
                raw.charAt(i)
            );
        }

        return formatted.toString();
    }
}
