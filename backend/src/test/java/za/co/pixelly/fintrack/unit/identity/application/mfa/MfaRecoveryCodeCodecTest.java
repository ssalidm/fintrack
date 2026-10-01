package za.co.pixelly.fintrack.unit.identity.application.mfa;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import za.co.pixelly.fintrack.identity.application.OpaqueTokenCodec;
import za.co.pixelly.fintrack.identity.application.mfa.MfaRecoveryCodeCodec;

import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MfaRecoveryCodeCodecTest {

    private MfaRecoveryCodeCodec codec;

    @BeforeEach
    void setUp() {
        codec =
            new MfaRecoveryCodeCodec(
                new OpaqueTokenCodec()
            );
    }

    @Test
    void generatesTenUniqueRecoveryCodes() {
        List<String> codes =
            codec.generate();

        assertEquals(10, codes.size());

        assertEquals(
            10,
            new HashSet<>(codes).size()
        );
    }

    @Test
    void generatesReadableCodeFormat() {
        String code =
            codec.generate().getFirst();

        assertTrue(
            code.matches(
                "[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}"
                    + "-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}"
                    + "-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}"
                    + "-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}"
            )
        );
    }

    @Test
    void hashingIgnoresFormattingAndCase() {
        String formatted =
            "7MDW-K5P3-X92H-QRT6";

        String unformatted =
            "7mdwk5p3x92hqrt6";

        assertEquals(
            codec.hash(formatted),
            codec.hash(unformatted)
        );
    }
}
