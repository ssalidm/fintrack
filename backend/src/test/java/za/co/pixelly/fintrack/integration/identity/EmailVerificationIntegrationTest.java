package za.co.pixelly.fintrack.integration.identity;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import za.co.pixelly.fintrack.identity.application.EmailVerificationService;
import za.co.pixelly.fintrack.identity.application.OpaqueTokenCodec;
import za.co.pixelly.fintrack.identity.domain.ApplicationRole;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.domain.UserRole;
import za.co.pixelly.fintrack.identity.persistence.ApplicationRoleRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRoleRepository;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class EmailVerificationIntegrationTest
    extends AbstractIntegrationTest {

    private static final String DEFAULT_ROLE =
        "ROLE_USER";

    @Autowired
    private OpaqueTokenCodec tokenCodec;

    @Autowired
    private EmailVerificationService
        emailVerificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private ApplicationRoleRepository
        applicationRoleRepository;

    @Autowired
    private Clock applicationClock;


    @Test
    void pendingUserReceivesHashedVerificationToken()
        throws Exception {

        String email =
            uniqueEmail(
                "verification-hash"
            );

        createPendingUser(
            email
        );

        String rawToken =
            emailSender.tokenFor(
                email
            );

        assertNotNull(
            rawToken
        );

        String hash =
            tokenCodec.hash(
                rawToken
            );

        Integer tokenCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.email_verification_tokens
                    WHERE token_hash = ?
                    """,
                Integer.class,
                hash
            );

        assertEquals(
            1,
            tokenCount
        );

        assertNotEquals(
            rawToken,
            hash
        );

        assertEquals(
            64,
            hash.length()
        );
    }


    @Test
    void validTokenVerifiesUser()
        throws Exception {

        String email =
            uniqueEmail(
                "verify"
            );

        createPendingUser(
            email
        );

        String token =
            emailSender.tokenFor(
                email
            );

        verify(
            token
        )
            .andExpect(
                status().isOk()
            )
            .andExpect(
                jsonPath("$.success")
                    .value(true)
            );

        String status =
            jdbcTemplate.queryForObject(
                """
                    SELECT status
                    FROM identity.users
                    WHERE email = ?
                    """,
                String.class,
                email
            );

        assertEquals(
            "ACTIVE",
            status
        );

        Object verifiedAt =
            jdbcTemplate.queryForObject(
                """
                    SELECT email_verified_at
                    FROM identity.users
                    WHERE email = ?
                    """,
                Object.class,
                email
            );

        assertNotNull(
            verifiedAt
        );

        Object consumedAt =
            jdbcTemplate.queryForObject(
                """
                    SELECT consumed_at
                    FROM identity.email_verification_tokens
                    WHERE token_hash = ?
                    """,
                Object.class,
                tokenCodec.hash(
                    token
                )
            );

        assertNotNull(
            consumedAt
        );

        UUID userId =
            jdbcTemplate.queryForObject(
                """
                    SELECT id
                    FROM identity.users
                    WHERE email = ?
                    """,
                UUID.class,
                email
            );

        Integer templateCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM finance.category_templates
                    WHERE active = TRUE
                    """,
                Integer.class
            );

        Integer categoryCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM finance.categories
                    WHERE user_id = ?
                    """,
                Integer.class,
                userId
            );

        assertEquals(
            templateCount,
            categoryCount,
            "Activating a verified user should provision default categories"
        );
    }


    @Test
    void verificationTokenCannotBeReplayed()
        throws Exception {

        String email =
            uniqueEmail(
                "replay"
            );

        createPendingUser(
            email
        );

        String token =
            emailSender.tokenFor(
                email
            );

        verify(
            token
        )
            .andExpect(
                status().isOk()
            );

        verify(
            token
        )
            .andExpect(
                status().isBadRequest()
            );
    }


    @Test
    void resendInvalidatesPreviousToken()
        throws Exception {

        String email =
            uniqueEmail(
                "resend"
            );

        createPendingUser(
            email
        );

        String firstToken =
            emailSender.tokenFor(
                email
            );

        resend(
            email
        );

        String secondToken =
            emailSender.tokenFor(
                email
            );

        assertNotNull(
            secondToken
        );

        assertNotEquals(
            firstToken,
            secondToken
        );

        Object invalidatedAt =
            jdbcTemplate.queryForObject(
                """
                    SELECT invalidated_at
                    FROM identity.email_verification_tokens
                    WHERE token_hash = ?
                    """,
                Object.class,
                tokenCodec.hash(
                    firstToken
                )
            );

        assertNotNull(
            invalidatedAt
        );

        Integer activeTokens =
            jdbcTemplate.queryForObject(
                """
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

        assertEquals(
            1,
            activeTokens
        );
    }


    @Test
    void oldTokenCannotBeUsedAfterResend()
        throws Exception {

        String email =
            uniqueEmail(
                "old-token"
            );

        createPendingUser(
            email
        );

        String oldToken =
            emailSender.tokenFor(
                email
            );

        resend(
            email
        );

        verify(
            oldToken
        )
            .andExpect(
                status().isBadRequest()
            );

        String newToken =
            emailSender.tokenFor(
                email
            );

        verify(
            newToken
        )
            .andExpect(
                status().isOk()
            );
    }


    @Test
    void resendDoesNotRevealWhetherAccountExists()
        throws Exception {

        mockMvc.perform(
                post(
                    api(
                        "/auth/resend-verification"
                    )
                )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "email":
                          "unknown-%s@example.com"
                        }
                        """.formatted(
                        UUID.randomUUID()
                    ))
            )
            .andExpect(
                status().isAccepted()
            )
            .andExpect(
                jsonPath("$.success")
                    .value(true)
            );
    }


    private void createPendingUser(
        String email
    ) {

        Instant now =
            applicationClock.instant();

        User user =
            User.registerExternal(
                email,
                "David",
                "Test",
                false,
                now
            );

        userRepository.saveAndFlush(
            user
        );

        ApplicationRole role =
            applicationRoleRepository
                .findByCode(
                    DEFAULT_ROLE
                )
                .orElseThrow(
                    () ->
                        new IllegalStateException(
                            "Required role ROLE_USER is not configured"
                        )
                );

        userRoleRepository
            .saveAndFlush(
                UserRole.assign(
                    user,
                    role,
                    now
                )
            );

        emailVerificationService.issueFor(
            user
        );
    }


    private org.springframework.test.web.servlet.ResultActions
    verify(
        String token
    ) throws Exception {

        return mockMvc.perform(
            post(
                api(
                    "/auth/verify-email"
                )
            )
                .contentType(
                    "application/json"
                )
                .content("""
                    {
                      "token": "%s"
                    }
                    """.formatted(
                    token
                ))
        );
    }


    private void resend(
        String email
    ) throws Exception {

        mockMvc.perform(
                post(
                    api(
                        "/auth/resend-verification"
                    )
                )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "email": "%s"
                        }
                        """.formatted(
                        email
                    ))
            )
            .andExpect(
                status().isAccepted()
            );
    }


    private String uniqueEmail(
        String prefix
    ) {
        return "%s+%s@example.com"
            .formatted(
                prefix,
                UUID.randomUUID()
            );
    }
}
