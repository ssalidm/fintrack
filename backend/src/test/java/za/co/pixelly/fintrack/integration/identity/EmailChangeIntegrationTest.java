package za.co.pixelly.fintrack.integration.identity;

import com.eatthepath.otp.TimeBasedOneTimePasswordGenerator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import za.co.pixelly.fintrack.identity.application.mfa.EncryptedTotpSecret;
import za.co.pixelly.fintrack.identity.application.mfa.GeneratedTotpSecret;
import za.co.pixelly.fintrack.identity.application.mfa.TotpSecretCipher;
import za.co.pixelly.fintrack.identity.application.mfa.TotpService;
import za.co.pixelly.fintrack.identity.domain.UserMfa;
import za.co.pixelly.fintrack.identity.persistence.UserMfaRepository;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;
import za.co.pixelly.fintrack.integration.support.AuthenticatedUser;
import za.co.pixelly.fintrack.integration.support.IdentityTestClient;

import javax.crypto.spec.SecretKeySpec;
import java.time.Clock;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class EmailChangeIntegrationTest
    extends AbstractIntegrationTest {

    @Autowired
    private TotpService totpService;

    @Autowired
    private TotpSecretCipher totpSecretCipher;

    @Autowired
    private UserMfaRepository userMfaRepository;

    @Autowired
    private Clock clock;

    @Test
    void authenticatedUserCanRequestEmailChange()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "email-change-request"
            );

        String newEmail =
            "updated+" + user.userId()
                + "@example.com";

        mockMvc.perform(
                post(
                    "/api/v1/profile/change-email"
                )
                    .header(
                        "Authorization",
                        "Bearer " + user.accessToken()
                    )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "newEmail": "%s",
                              "currentPassword": "%s"
                            }
                            """.formatted(
                            newEmail,
                            IdentityTestClient.DEFAULT_PASSWORD
                        )
                    )
            )
            .andExpect(
                status().isOk()
            );

        /*
         * The verification message must be sent to
         * the NEW address, not the current one.
         */
        assertThat(
            emailChangeSender.email()
        ).isEqualTo(
            newEmail
        );

        assertThat(
            emailChangeSender.rawToken()
        ).isNotBlank();

        /*
         * Requesting the change must NOT mutate
         * identity.users yet.
         */
        String persistedEmail =
            jdbcTemplate.queryForObject(
                """
                    SELECT email
                    FROM identity.users
                    WHERE id = ?
                    """,
                String.class,
                user.userId()
            );

        assertThat(
            persistedEmail
        ).isEqualTo(
            user.email()
        );

        Integer activeRequests =
            jdbcTemplate.queryForObject(
                """
                    SELECT count(*)
                    FROM identity.email_change_requests
                    WHERE user_id = ?
                      AND confirmed_at IS NULL
                      AND invalidated_at IS NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertThat(
            activeRequests
        ).isEqualTo(1);
    }


    @Test
    void confirmingEmailChangeUpdatesEmailAndRevokesSessions()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "email-change-confirm"
            );

        /*
         * Create another authenticated session.
         * Confirmation must revoke both sessions,
         * not merely the session that requested the
         * email change.
         */
        identityTestClient.login(
            user.email(),
            IdentityTestClient.DEFAULT_PASSWORD
        );

        String newEmail =
            "confirmed+" + user.userId()
                + "@example.com";

        requestEmailChange(
            user,
            newEmail
        );

        String rawToken =
            emailChangeSender.rawToken();

        assertThat(
            rawToken
        ).isNotBlank();

        /*
         * Confirmation is intentionally public.
         * Possession of the single-use email token
         * proves control of the new address.
         */
        mockMvc.perform(
                post(
                    "/api/v1/auth/change-email/confirm"
                )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "token": "%s"
                            }
                            """.formatted(
                            rawToken
                        )
                    )
            )
            .andExpect(
                status().isOk()
            );

        String persistedEmail =
            jdbcTemplate.queryForObject(
                """
                    SELECT email
                    FROM identity.users
                    WHERE id = ?
                    """,
                String.class,
                user.userId()
            );

        assertThat(
            persistedEmail
        ).isEqualTo(
            newEmail
        );

        Integer confirmedRequests =
            jdbcTemplate.queryForObject(
                """
                    SELECT count(*)
                    FROM identity.email_change_requests
                    WHERE user_id = ?
                      AND confirmed_at IS NOT NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertThat(
            confirmedRequests
        ).isEqualTo(1);

        Integer activeSessions =
            jdbcTemplate.queryForObject(
                """
                    SELECT count(*)
                    FROM identity.auth_sessions
                    WHERE user_id = ?
                      AND revoked_at IS NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertThat(
            activeSessions
        ).isZero();

        Integer activeRefreshTokens =
            jdbcTemplate.queryForObject(
                """
                    SELECT count(*)
                    FROM identity.refresh_tokens
                    WHERE user_id = ?
                      AND revoked_at IS NULL
                      AND consumed_at IS NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertThat(
            activeRefreshTokens
        ).isZero();

        /*
         * The access token issued before the email
         * change must now be unusable because its
         * persisted session has been revoked.
         */
        mockMvc.perform(
                get(
                    "/api/v1/profile"
                )
                    .header(
                        "Authorization",
                        "Bearer " + user.accessToken()
                    )
            )
            .andExpect(
                status().isUnauthorized()
            );
    }


    @Test
    void confirmedEmailChangeTokenCannotBeReused()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "email-change-replay"
            );

        String newEmail =
            "replay+" + user.userId()
                + "@example.com";

        requestEmailChange(
            user,
            newEmail
        );

        String rawToken =
            emailChangeSender.rawToken();

        confirmEmailChange(
            rawToken
        );

        /*
         * A confirmation token is single-use.
         */
        mockMvc.perform(
                post(
                    "/api/v1/auth/change-email/confirm"
                )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "token": "%s"
                            }
                            """.formatted(
                            rawToken
                        )
                    )
            )
            .andExpect(
                status().isBadRequest()
            );
    }


    @Test
    void emailChangeRequiresCorrectCurrentPassword()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "email-change-wrong-password"
            );

        String newEmail =
            "wrong-password+" + user.userId()
                + "@example.com";

        mockMvc.perform(
                post(
                    "/api/v1/profile/change-email"
                )
                    .header(
                        "Authorization",
                        "Bearer " + user.accessToken()
                    )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "newEmail": "%s",
                              "currentPassword": "DefinitelyWrong123!"
                            }
                            """.formatted(
                            newEmail
                        )
                    )
            )
            .andExpect(
                status().isBadRequest()
            );

        Integer requests =
            jdbcTemplate.queryForObject(
                """
                    SELECT count(*)
                    FROM identity.email_change_requests
                    WHERE user_id = ?
                    """,
                Integer.class,
                user.userId()
            );

        assertThat(
            requests
        ).isZero();

        assertThat(
            emailChangeSender.rawToken()
        ).isNull();
    }


    @Test
    void newerEmailChangeRequestInvalidatesPreviousToken()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "email-change-newest-wins"
            );

        String firstEmail =
            "first+" + user.userId()
                + "@example.com";

        String secondEmail =
            "second+" + user.userId()
                + "@example.com";

        requestEmailChange(
            user,
            firstEmail
        );

        String firstToken =
            emailChangeSender.rawToken();

        assertThat(
            firstToken
        ).isNotBlank();

        requestEmailChange(
            user,
            secondEmail
        );

        String secondToken =
            emailChangeSender.rawToken();

        assertThat(
            secondToken
        ).isNotBlank();

        assertThat(
            secondToken
        ).isNotEqualTo(
            firstToken
        );

        /*
         * The first request was superseded by the second.
         */
        mockMvc.perform(
                post(
                    "/api/v1/auth/change-email/confirm"
                )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "token": "%s"
                            }
                            """.formatted(
                            firstToken
                        )
                    )
            )
            .andExpect(
                status().isBadRequest()
            );

        /*
         * The newest token must still work.
         */
        confirmEmailChange(
            secondToken
        );

        String persistedEmail =
            jdbcTemplate.queryForObject(
                """
                    SELECT email
                    FROM identity.users
                    WHERE id = ?
                    """,
                String.class,
                user.userId()
            );

        assertThat(
            persistedEmail
        ).isEqualTo(
            secondEmail
        );

        Integer activeRequests =
            jdbcTemplate.queryForObject(
                """
                    SELECT count(*)
                    FROM identity.email_change_requests
                    WHERE user_id = ?
                      AND confirmed_at IS NULL
                      AND invalidated_at IS NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertThat(
            activeRequests
        ).isZero();
    }


    @Test
    void confirmationFailsIfNewEmailWasClaimedAfterRequest()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "email-change-race-source"
            );

        AuthenticatedUser otherUser =
            createAuthenticatedUser(
                "email-change-race-target"
            );

        String newEmail =
            "race+" + user.userId()
                + "@example.com";

        requestEmailChange(
            user,
            newEmail
        );

        String rawToken =
            emailChangeSender.rawToken();

        assertThat(
            rawToken
        ).isNotBlank();

        /*
         * Simulate another account claiming the address
         * after the request was created but before the
         * verification link was used.
         */
        int updated =
            jdbcTemplate.update(
                """
                    UPDATE identity.users
                    SET email = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                    """,
                newEmail,
                otherUser.userId()
            );

        assertThat(
            updated
        ).isEqualTo(1);

        mockMvc.perform(
                post(
                    "/api/v1/auth/change-email/confirm"
                )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "token": "%s"
                            }
                            """.formatted(
                            rawToken
                        )
                    )
            )
            .andExpect(
                status().isConflict()
            );

        /*
         * The original user's email must remain unchanged.
         */
        String persistedEmail =
            jdbcTemplate.queryForObject(
                """
                    SELECT email
                    FROM identity.users
                    WHERE id = ?
                    """,
                String.class,
                user.userId()
            );

        assertThat(
            persistedEmail
        ).isEqualTo(
            user.email()
        );

        /*
         * This assertion is particularly important:
         *
         * EmailAlreadyInUseException is configured as
         * noRollbackFor, so the rejected request should
         * remain invalidated in the database.
         */
        Integer invalidatedRequests =
            jdbcTemplate.queryForObject(
                """
                    SELECT count(*)
                    FROM identity.email_change_requests
                    WHERE user_id = ?
                      AND invalidated_at IS NOT NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertThat(
            invalidatedRequests
        ).isEqualTo(1);

        Integer activeRequests =
            jdbcTemplate.queryForObject(
                """
                    SELECT count(*)
                    FROM identity.email_change_requests
                    WHERE user_id = ?
                      AND confirmed_at IS NULL
                      AND invalidated_at IS NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertThat(
            activeRequests
        ).isZero();
    }


    @Test
    void emailChangeRequiresMfaCodeWhenMfaIsEnabled()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "email-change-mfa-required"
            );

        enableMfa(user);

        String newEmail =
            "mfa-required+" + user.userId()
                + "@example.com";

        mockMvc.perform(
                post(
                    "/api/v1/profile/change-email"
                )
                    .header(
                        "Authorization",
                        "Bearer " + user.accessToken()
                    )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "newEmail": "%s",
                              "currentPassword": "%s"
                            }
                            """.formatted(
                            newEmail,
                            IdentityTestClient.DEFAULT_PASSWORD
                        )
                    )
            )
            .andExpect(
                status().isBadRequest()
            );

        assertNoEmailChangeRequest(
            user
        );

        assertThat(
            emailChangeSender.rawToken()
        ).isNull();
    }


    @Test
    void validTotpAuthorizesEmailChange()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "email-change-valid-totp"
            );

        byte[] rawSecret =
            enableMfa(user);

        String code =
            currentTotp(
                rawSecret
            );

        String newEmail =
            "valid-totp+" + user.userId()
                + "@example.com";

        requestEmailChangeWithMfa(
            user,
            newEmail,
            code
        )
            .andExpect(
                status().isOk()
            );

        assertThat(
            emailChangeSender.email()
        ).isEqualTo(
            newEmail
        );

        assertThat(
            emailChangeSender.rawToken()
        ).isNotBlank();

        Integer activeRequests =
            jdbcTemplate.queryForObject(
                """
                    SELECT count(*)
                    FROM identity.email_change_requests
                    WHERE user_id = ?
                      AND confirmed_at IS NULL
                      AND invalidated_at IS NULL
                    """,
                Integer.class,
                user.userId()
            );

        assertThat(
            activeRequests
        ).isEqualTo(1);
    }


    private void requestEmailChange(
        AuthenticatedUser user,
        String newEmail
    ) throws Exception {

        mockMvc.perform(
                post(
                    "/api/v1/profile/change-email"
                )
                    .header(
                        "Authorization",
                        "Bearer " + user.accessToken()
                    )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "newEmail": "%s",
                              "currentPassword": "%s"
                            }
                            """.formatted(
                            newEmail,
                            IdentityTestClient.DEFAULT_PASSWORD
                        )
                    )
            )
            .andExpect(
                status().isOk()
            );
    }


    @Test
    void totpUsedForEmailChangeCannotBeReused()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "email-change-totp-replay"
            );

        byte[] rawSecret =
            enableMfa(user);

        String code =
            currentTotp(
                rawSecret
            );

        String firstEmail =
            "totp-first+" + user.userId()
                + "@example.com";

        String secondEmail =
            "totp-second+" + user.userId()
                + "@example.com";

        requestEmailChangeWithMfa(
            user,
            firstEmail,
            code
        )
            .andExpect(
                status().isOk()
            );

        String firstToken =
            emailChangeSender.rawToken();

        assertThat(
            firstToken
        ).isNotBlank();

        /*
         * Reusing exactly the same TOTP timestep for
         * another sensitive operation must fail.
         */
        requestEmailChangeWithMfa(
            user,
            secondEmail,
            code
        )
            .andExpect(
                status().isBadRequest()
            );

        /*
         * Failed MFA reauthentication must NOT destroy
         * the already-valid pending email-change request.
         */
        String activeNewEmail =
            jdbcTemplate.queryForObject(
                """
                    SELECT new_email
                    FROM identity.email_change_requests
                    WHERE user_id = ?
                      AND confirmed_at IS NULL
                      AND invalidated_at IS NULL
                    """,
                String.class,
                user.userId()
            );

        assertThat(
            activeNewEmail
        ).isEqualTo(
            firstEmail
        );
    }


    private void confirmEmailChange(
        String rawToken
    ) throws Exception {

        mockMvc.perform(
                post(
                    "/api/v1/auth/change-email/confirm"
                )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "token": "%s"
                            }
                            """.formatted(
                            rawToken
                        )
                    )
            )
            .andExpect(
                status().isOk()
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
                    .verify(
                        rawSecret,
                        candidate
                    )
                    .valid()
            ) {
                return candidate;
            }
        }

        throw new IllegalStateException(
            "Could not generate invalid test TOTP"
        );
    }

    private ResultActions requestEmailChangeWithMfa(
        AuthenticatedUser user,
        String newEmail,
        String mfaCode
    ) throws Exception {

        return mockMvc.perform(
            post(
                "/api/v1/profile/change-email"
            )
                .header(
                    "Authorization",
                    "Bearer " + user.accessToken()
                )
                .contentType(
                    MediaType.APPLICATION_JSON
                )
                .content(
                    """
                        {
                          "newEmail": "%s",
                          "currentPassword": "%s",
                          "mfaCode": "%s"
                        }
                        """.formatted(
                        newEmail,
                        IdentityTestClient.DEFAULT_PASSWORD,
                        mfaCode
                    )
                )
        );
    }

    private void assertNoEmailChangeRequest(
        AuthenticatedUser user
    ) {

        Integer requests =
            jdbcTemplate.queryForObject(
                """
                    SELECT count(*)
                    FROM identity.email_change_requests
                    WHERE user_id = ?
                    """,
                Integer.class,
                user.userId()
            );

        assertThat(
            requests
        ).isZero();
    }
}
