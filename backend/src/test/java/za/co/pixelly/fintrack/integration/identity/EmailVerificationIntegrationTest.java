package za.co.pixelly.fintrack.integration.identity;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import za.co.pixelly.fintrack.identity.application.OpaqueTokenCodec;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class EmailVerificationIntegrationTest
    extends AbstractIntegrationTest {

    @Autowired
    private OpaqueTokenCodec tokenCodec;

    @Test
    void registrationIssuesHashedVerificationToken()
        throws Exception {

        String email =
            uniqueEmail("verification-hash");

        register(email);

        String rawToken =
            emailSender.tokenFor(email);

        assertNotNull(rawToken);

        String hash =
            tokenCodec.hash(rawToken);

        Integer tokenCount =
            jdbcTemplate.queryForObject("""
                    SELECT COUNT(*)
                    FROM identity.email_verification_tokens
                    WHERE token_hash = ?
                    """,
                Integer.class,
                hash
            );

        assertEquals(1, tokenCount);
        assertNotEquals(rawToken, hash);
        assertEquals(64, hash.length());
    }

    @Test
    void validTokenVerifiesUser()
        throws Exception {

        String email =
            uniqueEmail("verify");

        register(email);

        String token =
            emailSender.tokenFor(email);

        mockMvc.perform(
                post("/api/v1/auth/verify-email")
                    .contentType("application/json")
                    .content("""
                        {
                          "token": "%s"
                        }
                        """.formatted(token))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.success").value(true)
            );

        String status =
            jdbcTemplate.queryForObject("""
                    SELECT status
                    FROM identity.users
                    WHERE email = ?
                    """,
                String.class,
                email
            );

        assertEquals("ACTIVE", status);

        Object verifiedAt =
            jdbcTemplate.queryForObject("""
                    SELECT email_verified_at
                    FROM identity.users
                    WHERE email = ?
                    """,
                Object.class,
                email
            );

        assertNotNull(verifiedAt);

        Object consumedAt =
            jdbcTemplate.queryForObject("""
                    SELECT consumed_at
                    FROM identity.email_verification_tokens
                    WHERE token_hash = ?
                    """,
                Object.class,
                tokenCodec.hash(token)
            );

        assertNotNull(consumedAt);
    }

    @Test
    void verificationTokenCannotBeReplayed()
        throws Exception {

        String email =
            uniqueEmail("replay");

        register(email);

        String token =
            emailSender.tokenFor(email);

        verify(token)
            .andExpect(status().isOk());

        verify(token)
            .andExpect(status().isBadRequest());
    }

    @Test
    void resendInvalidatesPreviousToken()
        throws Exception {

        String email =
            uniqueEmail("resend");

        register(email);

        String firstToken =
            emailSender.tokenFor(email);

        mockMvc.perform(
                post(
                    "/api/v1/auth/resend-verification"
                )
                    .contentType("application/json")
                    .content("""
                        {
                          "email": "%s"
                        }
                        """.formatted(email))
            )
            .andExpect(status().isAccepted());

        String secondToken =
            emailSender.tokenFor(email);

        assertNotNull(secondToken);
        assertNotEquals(
            firstToken,
            secondToken
        );

        Object invalidatedAt =
            jdbcTemplate.queryForObject("""
                    SELECT invalidated_at
                    FROM identity.email_verification_tokens
                    WHERE token_hash = ?
                    """,
                Object.class,
                tokenCodec.hash(firstToken)
            );

        assertNotNull(invalidatedAt);

        Integer activeTokens =
            jdbcTemplate.queryForObject("""
                    SELECT COUNT(*)
                    FROM identity.email_verification_tokens evt
                    JOIN identity.users u
                      ON u.id = evt.user_id
                    WHERE u.email = ?
                      AND evt.consumed_at IS NULL
                      AND evt.invalidated_at IS NULL
                    """,
                Integer.class,
                email
            );

        assertEquals(1, activeTokens);
    }

    @Test
    void oldTokenCannotBeUsedAfterResend()
        throws Exception {

        String email =
            uniqueEmail("old-token");

        register(email);

        String oldToken =
            emailSender.tokenFor(email);

        resend(email);

        verify(oldToken)
            .andExpect(status().isBadRequest());

        String newToken =
            emailSender.tokenFor(email);

        verify(newToken)
            .andExpect(status().isOk());
    }

    @Test
    void resendDoesNotRevealWhetherAccountExists()
        throws Exception {

        mockMvc.perform(
                post(
                    "/api/v1/auth/resend-verification"
                )
                    .contentType("application/json")
                    .content("""
                        {
                          "email":
                          "unknown-%s@example.com"
                        }
                        """.formatted(
                        UUID.randomUUID()
                    ))
            )
            .andExpect(status().isAccepted())
            .andExpect(
                jsonPath("$.success").value(true)
            );
    }

    @Test
    void verifiedUserCanLogin()
        throws Exception {

        String email =
            uniqueEmail("verified-login");

        register(email);

        String token =
            emailSender.tokenFor(email);

        verify(token)
            .andExpect(status().isOk());

        mockMvc.perform(
                post("/api/v1/auth/login")
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "email": "%s",
                          "password":
                          "SecurePassword123!"
                        }
                        """.formatted(email))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.accessToken"
                ).isNotEmpty()
            );
    }

    private void register(String email)
        throws Exception {

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
    }

    private org.springframework.test.web.servlet.ResultActions
    verify(String token)
        throws Exception {

        return mockMvc.perform(
            post("/api/v1/auth/verify-email")
                .contentType("application/json")
                .content("""
                    {
                      "token": "%s"
                    }
                    """.formatted(token))
        );
    }

    private void resend(String email)
        throws Exception {

        mockMvc.perform(
                post(
                    "/api/v1/auth/resend-verification"
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

    private String uniqueEmail(String prefix) {
        return "%s+%s@example.com"
            .formatted(
                prefix,
                UUID.randomUUID()
            );
    }
}
