package za.co.pixelly.fintrack.integration.identity;

import com.eatthepath.otp.TimeBasedOneTimePasswordGenerator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import za.co.pixelly.fintrack.identity.application.OpaqueTokenCodec;
import za.co.pixelly.fintrack.identity.application.mfa.*;
import za.co.pixelly.fintrack.identity.domain.MfaRecoveryCode;
import za.co.pixelly.fintrack.identity.domain.UserMfa;
import za.co.pixelly.fintrack.identity.persistence.MfaRecoveryCodeRepository;
import za.co.pixelly.fintrack.identity.persistence.UserMfaRepository;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;
import za.co.pixelly.fintrack.integration.support.AuthenticatedUser;
import za.co.pixelly.fintrack.integration.support.IdentityTestClient;

import javax.crypto.spec.SecretKeySpec;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MfaAuthenticationIntegrationTest
    extends AbstractIntegrationTest {

    @Autowired
    private TotpService totpService;

    @Autowired
    private TotpSecretCipher totpSecretCipher;

    @Autowired
    private UserMfaRepository userMfaRepository;

    @Autowired
    private Clock clock;

    @Autowired
    private OpaqueTokenCodec opaqueTokenCodec;

    @Autowired
    private MfaRecoveryCodeRepository recoveryCodeRepository;

    @Autowired
    private MfaRecoveryCodeCodec recoveryCodeCodec;

    private final JsonParser jsonParser =
        new JacksonJsonParser();

    @Test
    void validTotpCompletesMfaLoginAndCreatesSession()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "mfa-success"
            );

        byte[] rawSecret =
            enableMfa(user);

        Integer sessionsBeforeLogin =
            sessionCount(user);

        MvcResult loginResult =
            mockMvc.perform(
                    post("/api/v1/auth/login")
                        .header(
                            "User-Agent",
                            "reko MFA integration test"
                        )
                        .contentType(
                            MediaType.APPLICATION_JSON
                        )
                        .content("""
                            {
                              "email": "%s",
                              "password": "%s"
                            }
                            """.formatted(
                            user.email(),
                            IdentityTestClient.DEFAULT_PASSWORD
                        ))
                )
                .andExpect(status().isOk())
                .andExpect(
                    jsonPath("$.result.status")
                        .value("MFA_REQUIRED")
                )
                .andExpect(
                    jsonPath("$.result.tokens")
                        .doesNotExist()
                )
                .andExpect(
                    jsonPath(
                        "$.result.mfaChallenge.challengeToken"
                    ).isNotEmpty()
                )
                .andReturn();

        /*
         * First factor alone must not create another
         * authenticated session.
         */
        assertEquals(
            sessionsBeforeLogin,
            sessionCount(user)
        );

        String challengeToken =
            challengeToken(loginResult);

        String code =
            currentTotp(rawSecret);

        MvcResult verifyResult =
            mockMvc.perform(
                    post("/api/v1/auth/mfa/verify")
                        .contentType(
                            MediaType.APPLICATION_JSON
                        )
                        .content("""
                            {
                              "challengeToken": "%s",
                              "code": "%s"
                            }
                            """.formatted(
                            challengeToken,
                            code
                        ))
                )
                .andExpect(status().isOk())
                .andExpect(
                    jsonPath("$.result.accessToken")
                        .isNotEmpty()
                )
                .andExpect(
                    jsonPath("$.result.refreshToken")
                        .isNotEmpty()
                )
                .andExpect(
                    jsonPath("$.result.tokenType")
                        .value("Bearer")
                )
                .andReturn();

        /*
         * Successful second-factor verification now
         * creates the authenticated session.
         */
        assertEquals(
            sessionsBeforeLogin + 1,
            sessionCount(user)
        );

        Integer consumedChallenges =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.mfa_login_challenges
                    WHERE user_id = ?
                      AND consumed_at IS NOT NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertEquals(
            1,
            consumedChallenges
        );

        Long lastUsedTimeStep =
            jdbcTemplate.queryForObject(
                """
                    SELECT last_used_time_step
                    FROM identity.user_mfa
                    WHERE user_id = ?
                    """,
                Long.class,
                user.userId()
            );

        assertNotNull(
            lastUsedTimeStep
        );

        String accessToken =
            resultField(
                verifyResult,
                "accessToken"
            );

        /*
         * The token issued after MFA must behave like
         * any other authenticated access token.
         */
        mockMvc.perform(
                get("/api/v1/auth/me")
                    .header(
                        "Authorization",
                        "Bearer " + accessToken
                    )
            )
            .andExpect(status().isOk());
    }


    @Test
    void invalidTotpIncrementsChallengeAttemptCount()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser("mfa-invalid-code");

        byte[] rawSecret =
            enableMfa(user);

        MvcResult loginResult =
            loginForMfa(user);

        String challengeToken =
            challengeToken(loginResult);

        String invalidCode =
            invalidTotp(rawSecret);

        mockMvc.perform(
                post("/api/v1/auth/mfa/verify")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                          "challengeToken": "%s",
                          "code": "%s"
                        }
                        """.formatted(
                        challengeToken,
                        invalidCode
                    ))
            )
            .andExpect(status().isUnauthorized());

        Integer attempts =
            jdbcTemplate.queryForObject(
                """
                    SELECT attempt_count
                    FROM identity.mfa_login_challenges
                    WHERE user_id = ?
                      AND invalidated_at IS NULL
                      AND consumed_at IS NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertEquals(
            1,
            attempts
        );
    }


    @Test
    void maximumFailedTotpAttemptsInvalidateChallenge()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser("mfa-max-attempts");

        byte[] rawSecret =
            enableMfa(user);

        String challengeToken =
            challengeToken(
                loginForMfa(user)
            );

        String invalidCode =
            invalidTotp(rawSecret);

        for (int attempt = 0; attempt < 5; attempt++) {
            mockMvc.perform(
                    post("/api/v1/auth/mfa/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "challengeToken": "%s",
                              "code": "%s"
                            }
                            """.formatted(
                            challengeToken,
                            invalidCode
                        ))
                )
                .andExpect(status().isUnauthorized());
        }

        Map<String, Object> challenge =
            jdbcTemplate.queryForMap(
                """
                    SELECT
                        attempt_count,
                        invalidated_at
                    FROM identity.mfa_login_challenges
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                    LIMIT 1
                    """,
                user.userId()
            );

        assertEquals(
            5,
            ((Number) challenge.get(
                "attempt_count"
            )).intValue()
        );

        assertNotNull(
            challenge.get(
                "invalidated_at"
            )
        );

        /*
         * Even the correct OTP must now fail against
         * this invalidated challenge.
         */
        String validCode =
            currentTotp(rawSecret);

        mockMvc.perform(
                post("/api/v1/auth/mfa/verify")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                          "challengeToken": "%s",
                          "code": "%s"
                        }
                        """.formatted(
                        challengeToken,
                        validCode
                    ))
            )
            .andExpect(status().isUnauthorized());
    }


    @Test
    void consumedMfaChallengeCannotBeReused()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser("mfa-challenge-replay");

        byte[] rawSecret =
            enableMfa(user);

        String challengeToken =
            challengeToken(
                loginForMfa(user)
            );

        String code =
            currentTotp(rawSecret);

        verifyMfa(
            challengeToken,
            code
        )
            .andExpect(status().isOk());

        /*
         * Same challenge, same OTP.
         * The challenge is already consumed.
         */
        verifyMfa(
            challengeToken,
            code
        )
            .andExpect(status().isUnauthorized());

        Integer consumedCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.mfa_login_challenges
                    WHERE user_id = ?
                      AND consumed_at IS NOT NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertEquals(
            1,
            consumedCount
        );
    }


    @Test
    void successfullyUsedTotpCannotBeReusedWithNewChallenge()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser("mfa-totp-replay");

        byte[] rawSecret =
            enableMfa(user);

        String code =
            currentTotp(rawSecret);

        String firstChallenge =
            challengeToken(
                loginForMfa(user)
            );

        verifyMfa(
            firstChallenge,
            code
        )
            .andExpect(status().isOk());

        /*
         * Password authentication creates a completely
         * new MFA challenge.
         */
        String secondChallenge =
            challengeToken(
                loginForMfa(user)
            );

        /*
         * But the TOTP time-step was already successfully
         * used by the first challenge.
         */
        verifyMfa(
            secondChallenge,
            code
        )
            .andExpect(status().isUnauthorized());

        Integer secondAttempts =
            jdbcTemplate.queryForObject(
                """
                    SELECT attempt_count
                    FROM identity.mfa_login_challenges
                    WHERE token_hash = ?
                    """,
                Integer.class,
                opaqueTokenCodec.hash(
                    secondChallenge
                )
            );

        assertEquals(
            1,
            secondAttempts
        );
    }


    @Test
    void validRecoveryCodeCompletesMfaLogin()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser("mfa-recovery-success");

        byte[] rawSecret =
            enableMfa(user);

        String recoveryCode =
            issueRecoveryCode(user);

        int sessionsBefore =
            sessionCount(user);

        String challengeToken =
            challengeToken(
                loginForMfa(user)
            );

        MvcResult result =
            mockMvc.perform(
                    post("/api/v1/auth/mfa/recover")
                        .contentType(
                            MediaType.APPLICATION_JSON
                        )
                        .content("""
                            {
                              "challengeToken": "%s",
                              "recoveryCode": "%s"
                            }
                            """.formatted(
                            challengeToken,
                            recoveryCode
                        ))
                )
                .andExpect(status().isOk())
                .andExpect(
                    jsonPath("$.result.accessToken")
                        .isNotEmpty()
                )
                .andExpect(
                    jsonPath("$.result.refreshToken")
                        .isNotEmpty()
                )
                .andReturn();

        assertEquals(
            sessionsBefore + 1,
            sessionCount(user)
        );

        Integer usedCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.mfa_recovery_codes
                    WHERE user_id = ?
                      AND used_at IS NOT NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertEquals(
            1,
            usedCount
        );

        Integer consumedChallenges =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.mfa_login_challenges
                    WHERE user_id = ?
                      AND consumed_at IS NOT NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertEquals(
            1,
            consumedChallenges
        );
    }


    @Test
    void recoveryCodeCannotBeUsedTwice()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser("mfa-recovery-replay");

        enableMfa(user);

        String recoveryCode =
            issueRecoveryCode(user);

        String firstChallenge =
            challengeToken(
                loginForMfa(user)
            );

        recoverMfa(
            firstChallenge,
            recoveryCode
        )
            .andExpect(status().isOk());

        /*
         * New password authentication gives us a fresh
         * challenge, but the same recovery code is already used.
         */
        String secondChallenge =
            challengeToken(
                loginForMfa(user)
            );

        recoverMfa(
            secondChallenge,
            recoveryCode
        )
            .andExpect(status().isUnauthorized());

        Integer attempts =
            jdbcTemplate.queryForObject(
                """
                    SELECT attempt_count
                    FROM identity.mfa_login_challenges
                    WHERE token_hash = ?
                    """,
                Integer.class,
                opaqueTokenCodec.hash(
                    secondChallenge
                )
            );

        assertEquals(
            1,
            attempts
        );
    }


    @Test
    void invalidRecoveryCodeIncrementsChallengeAttemptCount()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser("mfa-invalid-recovery");

        enableMfa(user);

        String challengeToken =
            challengeToken(
                loginForMfa(user)
            );

        recoverMfa(
            challengeToken,
            "ABCD-EFGH-JKLM-NPQR"
        )
            .andExpect(status().isUnauthorized());

        Integer attempts =
            jdbcTemplate.queryForObject(
                """
                    SELECT attempt_count
                    FROM identity.mfa_login_challenges
                    WHERE token_hash = ?
                    """,
                Integer.class,
                opaqueTokenCodec.hash(
                    challengeToken
                )
            );

        assertEquals(
            1,
            attempts
        );
    }


    @Test
    void validTotpDisablesMfa()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser("mfa-disable-totp");

        byte[] rawSecret =
            enableMfa(user);

        /*
         * Add a recovery code as well so we can prove
         * disabling removes all MFA material.
         */
        issueRecoveryCode(user);

        String code =
            currentTotp(rawSecret);

        disableMfa(
            user,
            IdentityTestClient.DEFAULT_PASSWORD,
            code
        )
            .andExpect(status().isOk());

        assertMfaRemoved(user);
    }


    @Test
    void validRecoveryCodeDisablesMfa()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "mfa-disable-recovery"
            );

        enableMfa(user);

        String recoveryCode =
            issueRecoveryCode(user);

        disableMfa(
            user,
            IdentityTestClient.DEFAULT_PASSWORD,
            recoveryCode
        )
            .andExpect(status().isOk());

        assertMfaRemoved(user);
    }


    @Test
    void incorrectPasswordCannotDisableMfa()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "mfa-disable-password"
            );

        byte[] rawSecret =
            enableMfa(user);

        String code =
            currentTotp(rawSecret);

        disableMfa(
            user,
            "DefinitelyWrongPassword!",
            code
        )
            .andExpect(status().isBadRequest());

        assertMfaStillEnabled(user);
    }


    @Test
    void invalidMfaCodeCannotDisableMfa()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "mfa-disable-invalid-factor"
            );

        byte[] rawSecret =
            enableMfa(user);

        String invalidCode =
            invalidTotp(rawSecret);

        disableMfa(
            user,
            IdentityTestClient.DEFAULT_PASSWORD,
            invalidCode
        )
            .andExpect(status().isBadRequest());

        assertMfaStillEnabled(user);
    }


    @Test
    void disablingMfaInvalidatesOutstandingLoginChallenges()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "mfa-disable-challenge"
            );

        byte[] rawSecret =
            enableMfa(user);

        MvcResult loginResult =
            loginForMfa(user);

        String challengeToken =
            challengeToken(loginResult);

        String code =
            currentTotp(rawSecret);

        disableMfa(
            user,
            IdentityTestClient.DEFAULT_PASSWORD,
            code
        )
            .andExpect(status().isOk());

        Map<String, Object> challenge =
            jdbcTemplate.queryForMap(
                """
                    SELECT
                        consumed_at,
                        invalidated_at
                    FROM identity.mfa_login_challenges
                    WHERE token_hash = ?
                    """,
                opaqueTokenCodec.hash(
                    challengeToken
                )
            );

        assertNull(
            challenge.get("consumed_at")
        );

        assertNotNull(
            challenge.get("invalidated_at")
        );

        /*
         * The previously-issued challenge can no longer
         * complete authentication.
         */
        verifyMfa(
            challengeToken,
            code
        )
            .andExpect(status().isUnauthorized());
    }

    @Test
    void mfaStatusReportsDisabledWhenNotConfigured()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser("mfa-status-disabled");

        mockMvc.perform(
                get("/api/v1/auth/mfa/status")
                    .header(
                        "Authorization",
                        "Bearer " + user.accessToken()
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.enabled")
                    .value(false)
            )
            .andExpect(
                jsonPath("$.result.setupPending")
                    .value(false)
            )
            .andExpect(
                jsonPath("$.result.enabledAt")
                    .doesNotExist()
            )
            .andExpect(
                jsonPath("$.result.remainingRecoveryCodes")
                    .value(0)
            );
    }

    @Test
    void mfaStatusReportsEnabledAndRemainingRecoveryCodes()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser("mfa-status-enabled");

        enableMfa(user);

        issueRecoveryCode(user);
        issueRecoveryCode(user);

        mockMvc.perform(
                get("/api/v1/auth/mfa/status")
                    .header(
                        "Authorization",
                        "Bearer " + user.accessToken()
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.enabled")
                    .value(true)
            )
            .andExpect(
                jsonPath("$.result.setupPending")
                    .value(false)
            )
            .andExpect(
                jsonPath("$.result.enabledAt")
                    .isNotEmpty()
            )
            .andExpect(
                jsonPath("$.result.remainingRecoveryCodes")
                    .value(2)
            );
    }

    @Test
    void recoveryCodeRegenerationReplacesAllExistingCodes()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "mfa-regenerate-recovery"
            );

        byte[] rawSecret =
            enableMfa(user);

        String oldRecoveryCode =
            issueRecoveryCode(user);

        String code =
            currentTotp(rawSecret);

        MvcResult result =
            regenerateRecoveryCodes(
                user,
                IdentityTestClient.DEFAULT_PASSWORD,
                code
            )
                .andExpect(status().isOk())
                .andExpect(
                    jsonPath("$.result.recoveryCodes")
                        .isArray()
                )
                .andExpect(
                    jsonPath("$.result.recoveryCodes.length()")
                        .value(10)
                )
                .andReturn();

        Integer storedCodes =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.mfa_recovery_codes
                    WHERE user_id = ?
                      AND used_at IS NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertEquals(
            10,
            storedCodes
        );

        /*
         * The previous code must have been removed completely.
         */
        Integer oldCodeCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.mfa_recovery_codes
                    WHERE user_id = ?
                      AND code_hash = ?
                    """,
                Integer.class,
                user.userId(),
                recoveryCodeCodec.hash(
                    oldRecoveryCode
                )
            );

        assertEquals(
            0,
            oldCodeCount
        );

        List<String> newCodes =
            recoveryCodes(result);

        assertEquals(
            10,
            newCodes.size()
        );
    }

    @Test
    void oldRecoveryCodeCannotAuthenticateAfterRegeneration()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "mfa-regenerate-old-code"
            );

        byte[] rawSecret =
            enableMfa(user);

        String oldRecoveryCode =
            issueRecoveryCode(user);

        String code =
            currentTotp(rawSecret);

        regenerateRecoveryCodes(
            user,
            IdentityTestClient.DEFAULT_PASSWORD,
            code
        )
            .andExpect(status().isOk());

        String challengeToken =
            challengeToken(
                loginForMfa(user)
            );

        recoverMfa(
            challengeToken,
            oldRecoveryCode
        )
            .andExpect(status().isUnauthorized());
    }


    @Test
    void incorrectPasswordCannotRegenerateRecoveryCodes()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "mfa-regenerate-password"
            );

        byte[] rawSecret =
            enableMfa(user);

        String code =
            currentTotp(rawSecret);

        regenerateRecoveryCodes(
            user,
            "WrongPassword!",
            code
        )
            .andExpect(status().isBadRequest());
    }

    @Test
    void previouslyUsedTotpCannotRegenerateRecoveryCodes()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "mfa-regenerate"
            );

        byte[] rawSecret =
            enableMfa(user);

        String code =
            currentTotp(rawSecret);

        String challengeToken =
            challengeToken(
                loginForMfa(user)
            );

        verifyMfa(
            challengeToken,
            code
        )
            .andExpect(status().isOk());

        regenerateRecoveryCodes(
            user,
            IdentityTestClient.DEFAULT_PASSWORD,
            code
        )
            .andExpect(status().isBadRequest());
    }


    @Test
    void mfaAccountIsTemporarilyLockedAfterMaximumFailedAttempts()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "mfa-account-lockout"
            );

        byte[] rawSecret =
            enableMfa(user);

        String challengeToken =
            challengeToken(
                loginForMfa(user)
            );

        String invalidCode =
            invalidTotp(rawSecret);

        /*
         * Exhaust the MFA account-level attempt allowance.
         */
        for (int attempt = 0; attempt < 5; attempt++) {
            verifyMfa(
                challengeToken,
                invalidCode
            )
                .andExpect(
                    status().isUnauthorized()
                );
        }

        Map<String, Object> mfaState =
            jdbcTemplate.queryForMap(
                """
                    SELECT
                        failed_attempt_count,
                        locked_until
                    FROM identity.user_mfa
                    WHERE user_id = ?
                    """,
                user.userId()
            );

        /*
         * Our domain resets the counter when the lock
         * begins and uses locked_until as the lock state.
         */
        assertEquals(
            0,
            ((Number) mfaState.get(
                "failed_attempt_count"
            )).intValue()
        );

        assertNotNull(
            mfaState.get(
                "locked_until"
            )
        );

        Integer challengesBefore =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.mfa_login_challenges
                    WHERE user_id = ?
                    """,
                Integer.class,
                user.userId()
            );

        /*
         * Even with the correct password, the user must
         * not be able to obtain a fresh MFA challenge
         * while the account-level MFA lock is active.
         */
        mockMvc.perform(
                post("/api/v1/auth/login")
                    .header(
                        "User-Agent",
                        "reko MFA lockout test"
                    )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content("""
                        {
                          "email": "%s",
                          "password": "%s"
                        }
                        """.formatted(
                        user.email(),
                        IdentityTestClient.DEFAULT_PASSWORD
                    ))
            )
            .andExpect(
                status().isTooManyRequests()
            );

        Integer challengesAfter =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.mfa_login_challenges
                    WHERE user_id = ?
                    """,
                Integer.class,
                user.userId()
            );

        assertEquals(
            challengesBefore,
            challengesAfter
        );
    }


    private MvcResult loginForMfa(
        AuthenticatedUser user
    ) throws Exception {

        return mockMvc.perform(
                post("/api/v1/auth/login")
                    .header(
                        "User-Agent",
                        "reko MFA integration test"
                    )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content("""
                        {
                          "email": "%s",
                          "password": "%s"
                        }
                        """.formatted(
                        user.email(),
                        IdentityTestClient.DEFAULT_PASSWORD
                    ))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.status")
                    .value("MFA_REQUIRED")
            )
            .andReturn();
    }


    private ResultActions verifyMfa(
        String challengeToken,
        String code
    ) throws Exception {

        return mockMvc.perform(
            post("/api/v1/auth/mfa/verify")
                .contentType(
                    MediaType.APPLICATION_JSON
                )
                .content("""
                    {
                      "challengeToken": "%s",
                      "code": "%s"
                    }
                    """.formatted(
                    challengeToken,
                    code
                ))
        );
    }

    private String invalidTotp(
        byte[] rawSecret
    ) {

        for (
            String candidate : new String[]{
            "000000",
            "111111",
            "222222",
            "333333",
            "444444"
        }
        ) {
            if (
                !totpService
                    .verify(rawSecret, candidate)
                    .valid()
            ) {
                return candidate;
            }
        }

        throw new IllegalStateException(
            "Could not generate invalid test TOTP"
        );
    }


    private byte[] enableMfa(
        AuthenticatedUser user
    ) {
        Instant now =
            clock.instant();

        GeneratedTotpSecret generated =
            totpService.generateSecret(
                user.email()
            );

        byte[] rawSecret =
            generated.rawSecret();

        EncryptedTotpSecret encrypted =
            totpSecretCipher.encrypt(
                user.userId(),
                rawSecret
            );

        UserMfa userMfa =
            UserMfa.startSetup(
                user.userId(),
                encrypted.ciphertext(),
                encrypted.iv(),
                now
            );

        userMfa.enable(now);

        userMfaRepository.saveAndFlush(
            userMfa
        );

        return rawSecret;
    }

    private String currentTotp(
        byte[] rawSecret
    ) throws Exception {

        TimeBasedOneTimePasswordGenerator generator =
            new TimeBasedOneTimePasswordGenerator();

        SecretKeySpec key =
            new SecretKeySpec(
                rawSecret,
                generator.getAlgorithm()
            );

        return generator
            .generateOneTimePasswordString(
                key,
                clock.instant()
            );
    }

    @SuppressWarnings("unchecked")
    private String challengeToken(
        MvcResult result
    ) throws Exception {

        Map<String, Object> root =
            jsonParser.parseMap(
                result.getResponse()
                    .getContentAsString()
            );

        Map<String, Object> body =
            (Map<String, Object>) root.get(
                "result"
            );

        Map<String, Object> challenge =
            (Map<String, Object>) body.get(
                "mfaChallenge"
            );

        return (String) challenge.get(
            "challengeToken"
        );
    }

    @SuppressWarnings("unchecked")
    private String resultField(
        MvcResult result,
        String field
    ) throws Exception {

        Map<String, Object> root =
            jsonParser.parseMap(
                result.getResponse()
                    .getContentAsString()
            );

        Map<String, Object> body =
            (Map<String, Object>) root.get(
                "result"
            );

        return (String) body.get(field);
    }

    private ResultActions recoverMfa(
        String challengeToken,
        String recoveryCode
    ) throws Exception {

        return mockMvc.perform(
            post("/api/v1/auth/mfa/recover")
                .contentType(
                    MediaType.APPLICATION_JSON
                )
                .content("""
                    {
                      "challengeToken": "%s",
                      "recoveryCode": "%s"
                    }
                    """.formatted(
                    challengeToken,
                    recoveryCode
                ))
        );
    }

    private String issueRecoveryCode(
        AuthenticatedUser user
    ) {
        String rawCode =
            recoveryCodeCodec
                .generate()
                .getFirst();

        MfaRecoveryCode recoveryCode =
            MfaRecoveryCode.issue(
                user.userId(),
                recoveryCodeCodec.hash(rawCode),
                clock.instant()
            );

        recoveryCodeRepository.saveAndFlush(
            recoveryCode
        );

        return rawCode;
    }

    private Integer sessionCount(
        AuthenticatedUser user
    ) {
        return jdbcTemplate.queryForObject(
            """
                SELECT COUNT(*)
                FROM identity.auth_sessions
                WHERE user_id = ?
                """,
            Integer.class,
            user.userId()
        );
    }

    private ResultActions disableMfa(
        AuthenticatedUser user,
        String password,
        String mfaCode
    ) throws Exception {

        return mockMvc.perform(
            post("/api/v1/auth/mfa/disable")
                .header(
                    "Authorization",
                    "Bearer " + user.accessToken()
                )
                .contentType(
                    MediaType.APPLICATION_JSON
                )
                .content("""
                    {
                      "currentPassword": "%s",
                      "mfaCode": "%s"
                    }
                    """.formatted(
                    password,
                    mfaCode
                ))
        );
    }

    private void assertMfaRemoved(
        AuthenticatedUser user
    ) {

        Integer mfaCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.user_mfa
                    WHERE user_id = ?
                    """,
                Integer.class,
                user.userId()
            );

        assertEquals(
            0,
            mfaCount
        );

        Integer recoveryCodeCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.mfa_recovery_codes
                    WHERE user_id = ?
                    """,
                Integer.class,
                user.userId()
            );

        assertEquals(
            0,
            recoveryCodeCount
        );
    }

    private void assertMfaStillEnabled(
        AuthenticatedUser user
    ) {

        String status =
            jdbcTemplate.queryForObject(
                """
                    SELECT status
                    FROM identity.user_mfa
                    WHERE user_id = ?
                    """,
                String.class,
                user.userId()
            );

        assertEquals(
            "ENABLED",
            status
        );
    }

    private ResultActions regenerateRecoveryCodes(
        AuthenticatedUser user,
        String password,
        String code
    ) throws Exception {

        return mockMvc.perform(
            post("/api/v1/auth/mfa/recovery-codes/regenerate")
                .header(
                    "Authorization",
                    "Bearer " + user.accessToken()
                )
                .contentType(
                    MediaType.APPLICATION_JSON
                )
                .content("""
                    {
                      "currentPassword": "%s",
                      "code": "%s"
                    }
                    """.formatted(
                    password,
                    code
                ))
        );
    }

    @SuppressWarnings("unchecked")
    private List<String> recoveryCodes(
        MvcResult result
    ) throws Exception {

        Map<String, Object> root =
            jsonParser.parseMap(
                result.getResponse()
                    .getContentAsString()
            );

        Map<String, Object> body =
            (Map<String, Object>) root.get(
                "result"
            );

        return (List<String>) body.get(
            "recoveryCodes"
        );
    }
}
