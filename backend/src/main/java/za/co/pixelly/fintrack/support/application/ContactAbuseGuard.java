package za.co.pixelly.fintrack.support.application;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.springframework.stereotype.Component;
import za.co.pixelly.fintrack.config.support.SupportProperties;
import za.co.pixelly.fintrack.support.api.SupportContactRequest;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

@Component
public class ContactAbuseGuard {

    private static final long
        MAX_RATE_LIMIT_IDENTITIES =
        20_000;

    private static final long
        MAX_DUPLICATE_FINGERPRINTS =
        20_000;


    private final SupportProperties properties;

    private final Cache<String, Bucket>
        ipBuckets;

    private final Cache<String, Bucket>
        emailBuckets;

    private final Cache<String, Boolean>
        recentSubmissions;


    public ContactAbuseGuard(
        SupportProperties properties
    ) {
        this.properties =
            properties;

        this.ipBuckets =
            Caffeine.newBuilder()
                .maximumSize(
                    MAX_RATE_LIMIT_IDENTITIES
                )
                .expireAfterAccess(
                    Duration.ofDays(2)
                )
                .build();

        this.emailBuckets =
            Caffeine.newBuilder()
                .maximumSize(
                    MAX_RATE_LIMIT_IDENTITIES
                )
                .expireAfterAccess(
                    Duration.ofHours(2)
                )
                .build();

        this.recentSubmissions =
            Caffeine.newBuilder()
                .maximumSize(
                    MAX_DUPLICATE_FINGERPRINTS
                )
                .expireAfterWrite(
                    properties
                        .duplicateWindow()
                )
                .build();
    }


    public void checkRateLimits(
        String clientIp,
        String email
    ) {
        String ipKey =
            hash(
                "ip:"
                    + normalize(clientIp)
            );

        Bucket ipBucket =
            ipBuckets.get(
                ipKey,
                ignored ->
                    createIpBucket()
            );

        consume(ipBucket);

        String emailKey =
            hash(
                "email:"
                    + normalizeEmail(
                    email
                )
            );

        Bucket emailBucket =
            emailBuckets.get(
                emailKey,
                ignored ->
                    createEmailBucket()
            );

        consume(emailBucket);
    }


    public Optional<String> reserveSubmission(
        SupportContactRequest request
    ) {
        String fingerprint =
            hash(
                normalizeEmail(
                    request.email()
                )
                    + "\n"
                    + request.topic().name()
                    + "\n"
                    + normalizeMessage(
                    request.message()
                )
            );

        Boolean previous =
            recentSubmissions
                .asMap()
                .putIfAbsent(
                    fingerprint,
                    Boolean.TRUE
                );

        if (previous != null) {
            return Optional.empty();
        }

        return Optional.of(
            fingerprint
        );
    }


    public void releaseSubmission(
        String fingerprint
    ) {
        recentSubmissions.invalidate(
            fingerprint
        );
    }


    private Bucket createIpBucket() {
        SupportProperties.RateLimit limits =
            properties.rateLimit();

        Bandwidth burst =
            Bandwidth.builder()
                .capacity(
                    limits
                        .ipBurstCapacity()
                )
                .refillGreedy(
                    limits
                        .ipBurstCapacity(),
                    limits
                        .ipBurstWindow()
                )
                .build();

        Bandwidth daily =
            Bandwidth.builder()
                .capacity(
                    limits
                        .ipDailyCapacity()
                )
                .refillGreedy(
                    limits
                        .ipDailyCapacity(),
                    limits
                        .ipDailyWindow()
                )
                .build();

        return Bucket.builder()
            .addLimit(burst)
            .addLimit(daily)
            .build();
    }


    private Bucket createEmailBucket() {
        SupportProperties.RateLimit limits =
            properties.rateLimit();

        Bandwidth email =
            Bandwidth.builder()
                .capacity(
                    limits
                        .emailCapacity()
                )
                .refillGreedy(
                    limits
                        .emailCapacity(),
                    limits
                        .emailWindow()
                )
                .build();

        return Bucket.builder()
            .addLimit(email)
            .build();
    }


    private void consume(
        Bucket bucket
    ) {
        ConsumptionProbe probe =
            bucket.tryConsumeAndReturnRemaining(
                1
            );

        if (probe.isConsumed()) {
            return;
        }

        long retryAfterSeconds =
            Math.max(
                1,
                Duration
                    .ofNanos(
                        probe
                            .getNanosToWaitForRefill()
                    )
                    .toSeconds()
            );

        throw new SupportRateLimitExceededException(
            retryAfterSeconds
        );
    }


    private String normalizeEmail(
        String value
    ) {
        return normalize(value)
            .toLowerCase(
                Locale.ROOT
            );
    }


    private String normalizeMessage(
        String value
    ) {
        if (value == null) {
            return "";
        }

        return value
            .trim()
            .replaceAll(
                "\\s+",
                " "
            );
    }


    private String normalize(
        String value
    ) {
        return value == null
            ? ""
            : value.trim();
    }


    private String hash(
        String value
    ) {
        try {
            MessageDigest digest =
                MessageDigest.getInstance(
                    "SHA-256"
                );

            byte[] result =
                digest.digest(
                    value.getBytes(
                        StandardCharsets.UTF_8
                    )
                );

            return HexFormat
                .of()
                .formatHex(result);

        } catch (
            NoSuchAlgorithmException exception
        ) {
            throw new IllegalStateException(
                "SHA-256 is unavailable",
                exception
            );
        }
    }
}
