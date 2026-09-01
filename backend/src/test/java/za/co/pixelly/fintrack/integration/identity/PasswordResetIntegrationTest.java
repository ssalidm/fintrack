package za.co.pixelly.fintrack.integration.identity;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.boot.json.JsonParser;
import za.co.pixelly.fintrack.identity.application.OpaqueTokenCodec;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PasswordResetIntegrationTest
    extends AbstractIntegrationTest {

    @Autowired
    private OpaqueTokenCodec tokenCodec;

    private final JsonParser jsonParser = new JacksonJsonParser();

    @Test
    void forgotPasswordStoresOnlyHashedToken()
        throws Exception {

        String email =
            createVerifiedUser("reset-hash");

        requestReset(email);

        String rawToken =
            passwordResetSender.tokenFor(email);

        assertNotNull(rawToken);

        String hash =
            tokenCodec.hash(rawToken);

        Integer count =
            jdbcTemplate.queryForObject("""
                        SELECT COUNT(*)
                        FROM identity.password_reset_tokens
                        WHERE token_hash = ?
                        """,
                Integer.class,
                hash
            );

        assertEquals(1, count);
        assertEquals(64, hash.length());
        assertNotEquals(rawToken, hash);
    }

    @Test
    void forgotPasswordDoesNotRevealUnknownEmail()
        throws Exception {

        String email =
            "unknown-%s@example.com"
                .formatted(UUID.randomUUID());

        mockMvc.perform(
                post("/api/v1/auth/forgot-password")
                    .contentType("application/json")
                    .content("""
                                        {
                                          "email": "%s"
                                        }
                                        """.formatted(email))
            )
            .andExpect(status().isAccepted())
            .andExpect(
                jsonPath("$.success")
                    .value(true)
            );

        assertNull(
            passwordResetSender.tokenFor(email)
        );
    }

    @Test
    void secondResetRequestInvalidatesPreviousToken()
        throws Exception {

        String email =
            createVerifiedUser("reset-reissue");

        requestReset(email);

        String firstToken =
            passwordResetSender.tokenFor(email);

        requestReset(email);

        String secondToken =
            passwordResetSender.tokenFor(email);

        assertNotEquals(
            firstToken,
            secondToken
        );

        Object invalidatedAt =
            jdbcTemplate.queryForObject("""
                        SELECT invalidated_at
                        FROM identity.password_reset_tokens
                        WHERE token_hash = ?
                        """,
                Object.class,
                tokenCodec.hash(firstToken)
            );

        assertNotNull(invalidatedAt);

        Integer activeCount =
            jdbcTemplate.queryForObject("""
                        SELECT COUNT(*)
                        FROM identity.password_reset_tokens prt
                        JOIN identity.users u
                          ON u.id = prt.user_id
                        WHERE u.email = ?
                          AND prt.consumed_at IS NULL
                          AND prt.invalidated_at IS NULL
                        """,
                Integer.class,
                email
            );

        assertEquals(1, activeCount);
    }

    @Test
    void resetChangesPasswordAndConsumesToken()
        throws Exception {

        String email =
            createVerifiedUser("reset-success");

        requestReset(email);

        String token =
            passwordResetSender.tokenFor(email);

        resetPassword(
            token,
            "NewSecurePassword123!"
        )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.success")
                    .value(true)
            );

        Object consumedAt =
            jdbcTemplate.queryForObject("""
                        SELECT consumed_at
                        FROM identity.password_reset_tokens
                        WHERE token_hash = ?
                        """,
                Object.class,
                tokenCodec.hash(token)
            );

        assertNotNull(consumedAt);


        // Old password no longer works.
        login(
            email,
            "SecurePassword123!"
        )
            .andExpect(status().isUnauthorized());


        // New password works.
        login(
            email,
            "NewSecurePassword123!"
        )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.accessToken"
                ).isNotEmpty()
            );
    }

    @Test
    void resetTokenCannotBeReplayed()
        throws Exception {

        String email =
            createVerifiedUser("reset-replay");

        requestReset(email);

        String token =
            passwordResetSender.tokenFor(email);

        resetPassword(
            token,
            "NewSecurePassword123!"
        )
            .andExpect(status().isOk());

        resetPassword(
            token,
            "AnotherSecurePassword123!"
        )
            .andExpect(status().isBadRequest());
    }

    @Test
    void expiredResetTokenIsRejected()
        throws Exception {

        String email =
            createVerifiedUser("reset-expired");

        requestReset(email);

        String token =
            passwordResetSender.tokenFor(email);

        String hash =
            tokenCodec.hash(token);

        /*
         * Move both timestamps back while preserving:
         *
         * expires_at > created_at
         */
        int updated =
            jdbcTemplate.update("""
                        UPDATE identity.password_reset_tokens
                           SET created_at =
                                   CURRENT_TIMESTAMP
                                   - INTERVAL '2 hours',
                               expires_at =
                                   CURRENT_TIMESTAMP
                                   - INTERVAL '1 hour'
                         WHERE token_hash = ?
                        """,
                hash
            );

        assertEquals(1, updated);

        resetPassword(
            token,
            "NewSecurePassword123!"
        )
            .andExpect(status().isBadRequest());
    }

    @Test
    void passwordResetRevokesExistingSessionsAndRefreshTokens()
        throws Exception {

        String email =
            createVerifiedUser("reset-session");

        var loginResult =
            login(
                email,
                "SecurePassword123!"
            )
                .andExpect(status().isOk())
                .andReturn();

        String response =
            loginResult
                .getResponse()
                .getContentAsString();

        Map<String, Object> root =
            jsonParser.parseMap(response);

        @SuppressWarnings("unchecked")
        Map<String, Object> result =
            (Map<String, Object>)
                root.get("result");

        String refreshToken =
            (String)
                result.get("refreshToken");

        String refreshHash =
            tokenCodec.hash(refreshToken);


        requestReset(email);

        String resetToken =
            passwordResetSender.tokenFor(email);

        resetPassword(
            resetToken,
            "NewSecurePassword123!"
        )
            .andExpect(status().isOk());


        Integer activeSessions =
            jdbcTemplate.queryForObject("""
                        SELECT COUNT(*)
                        FROM identity.auth_sessions s
                        JOIN identity.users u
                          ON u.id = s.user_id
                        WHERE u.email = ?
                          AND s.revoked_at IS NULL
                        """,
                Integer.class,
                email
            );

        assertEquals(0, activeSessions);


        Object refreshRevokedAt =
            jdbcTemplate.queryForObject("""
                        SELECT revoked_at
                        FROM identity.refresh_tokens
                        WHERE token_hash = ?
                        """,
                Object.class,
                refreshHash
            );

        assertNotNull(refreshRevokedAt);


        // Previously issued refresh token is dead.
        mockMvc.perform(
                post("/api/v1/auth/refresh")
                    .contentType(
                        "application/json"
                    )
                    .content("""
                                        {
                                          "refreshToken": "%s"
                                        }
                                        """.formatted(refreshToken))
            )
            .andExpect(status().isUnauthorized());
    }


    // -----------------------------------------------------
    // Helpers
    // -----------------------------------------------------

    private String createVerifiedUser(String prefix)
        throws Exception {

        String email =
            "%s+%s@example.com"
                .formatted(
                    prefix,
                    UUID.randomUUID()
                );

        mockMvc.perform(
                post("/api/v1/auth/register")
                    .contentType(
                        "application/json"
                    )
                    .content("""
                                        {
                                          "email": "%s",
                                          "password":
                                          "SecurePassword123!",
                                          "firstName": "David",
                                          "lastName": "Test"
                                        }
                                        """.formatted(email))
            )
            .andExpect(status().isCreated());

        String verificationToken =
            emailSender.tokenFor(email);

        assertNotNull(verificationToken);

        mockMvc.perform(
                post(
                    "/api/v1/auth/verify-email"
                )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                                        {
                                          "token": "%s"
                                        }
                                        """.formatted(
                        verificationToken
                    ))
            )
            .andExpect(status().isOk());

        return email;
    }

    private void requestReset(String email)
        throws Exception {

        mockMvc.perform(
                post(
                    "/api/v1/auth/forgot-password"
                )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                                        {
                                          "email": "%s"
                                        }
                                        """.formatted(email))
            )
            .andExpect(status().isAccepted());
    }

    private org.springframework.test.web.servlet.ResultActions
    resetPassword(
        String token,
        String password
    ) throws Exception {

        return mockMvc.perform(
            post("/api/v1/auth/reset-password")
                .contentType("application/json")
                .content("""
                                {
                                  "token": "%s",
                                  "newPassword": "%s"
                                }
                                """.formatted(
                    token,
                    password
                ))
        );
    }

    private org.springframework.test.web.servlet.ResultActions
    login(
        String email,
        String password
    ) throws Exception {

        return mockMvc.perform(
            post("/api/v1/auth/login")
                .contentType("application/json")
                .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(
                    email,
                    password
                ))
        );
    }
}
