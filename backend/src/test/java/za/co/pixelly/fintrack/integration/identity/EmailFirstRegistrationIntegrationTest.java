package za.co.pixelly.fintrack.integration.identity;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import za.co.pixelly.fintrack.identity.application.OpaqueTokenCodec;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class EmailFirstRegistrationIntegrationTest
    extends AbstractIntegrationTest {

    private static final String PASSWORD = "SecurePassword123!";

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OpaqueTokenCodec tokenCodec;


    @Test
    void startRegistrationCreatesRequestWithoutCreatingUser()
        throws Exception {

        String email = uniqueEmail("registration-start");

        startRegistration(email);

        String rawToken =
            registrationEmailSender
                .tokenFor(email);

        assertNotNull(rawToken);
        assertFalse(rawToken.isBlank());

        Integer userCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.users
                    WHERE email = ?
                    """,
                Integer.class,
                email
            );

        assertEquals(
            0,
            userCount,
            "Starting registration must not create a user"
        );

        Map<String, Object> request =
            jdbcTemplate.queryForMap(
                """
                    SELECT
                        token_hash,
                        consumed_at,
                        invalidated_at
                    FROM identity.registration_requests
                    WHERE email = ?
                    """,
                email
            );

        String expectedHash =
            tokenCodec.hash(rawToken);

        assertEquals(
            expectedHash,
            request.get("token_hash")
        );

        assertNotEquals(
            rawToken,
            request.get("token_hash"),
            "Raw registration tokens must never be stored"
        );

        assertNull(
            request.get("consumed_at")
        );

        assertNull(
            request.get("invalidated_at")
        );
    }


    @Test
    void restartingRegistrationInvalidatesPreviousRequest()
        throws Exception {

        String email = uniqueEmail("registration-restart");

        startRegistration(email);

        String firstToken =
            registrationEmailSender
                .tokenFor(email);

        assertNotNull(firstToken);

        startRegistration(email);

        String secondToken =
            registrationEmailSender
                .tokenFor(email);

        assertNotNull(secondToken);

        assertNotEquals(
            firstToken,
            secondToken
        );

        String firstHash =
            tokenCodec.hash(
                firstToken
            );

        String secondHash =
            tokenCodec.hash(
                secondToken
            );

        Object firstInvalidatedAt =
            jdbcTemplate.queryForObject(
                """
                    SELECT invalidated_at
                    FROM identity.registration_requests
                    WHERE token_hash = ?
                    """,
                Object.class,
                firstHash
            );

        assertNotNull(
            firstInvalidatedAt,
            "Previous registration request should be invalidated"
        );

        Integer activeSecondRequest =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.registration_requests
                    WHERE token_hash = ?
                      AND consumed_at IS NULL
                      AND invalidated_at IS NULL
                    """,
                Integer.class,
                secondHash
            );

        assertEquals(
            1,
            activeSecondRequest
        );
    }


    @Test
    void existingUserReceivesSameAcceptedResponseWithoutRegistrationEmail()
        throws Exception {

        String email =
            uniqueEmail("existing-user");

        registerLegacyUser(
            email,
            PASSWORD
        );

        mockMvc.perform(
                post(
                    api(
                        "/auth/registration/start"
                    )
                )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "email": "%s"
                            }
                            """.formatted(email)
                    )
            )
            .andExpect(
                status().isAccepted()
            )
            .andExpect(
                jsonPath("$.success")
                    .value(true)
            )
            .andExpect(
                jsonPath("$.status")
                    .value(202)
            );

        assertFalse(
            registrationEmailSender
                .hasEmailFor(email),
            "Existing users must not receive a registration email"
        );

        Integer requestCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.registration_requests
                    WHERE email = ?
                    """,
                Integer.class,
                email
            );

        assertEquals(
            0,
            requestCount
        );
    }


    @Test
    void completesRegistrationAndCreatesActiveVerifiedUser()
        throws Exception {

        String email =
            uniqueEmail("registration-complete");

        startRegistration(email);

        String token =
            registrationEmailSender
                .tokenFor(email);

        assertNotNull(token);

        completeRegistration(
            token,
            "David",
            "Ssali",
            "Dave",
            PASSWORD
        )
            .andExpect(
                status().isCreated()
            )
            .andExpect(
                jsonPath("$.success")
                    .value(true)
            )
            .andExpect(
                jsonPath("$.status")
                    .value(201)
            );

        Map<String, Object> user =
            jdbcTemplate.queryForMap(
                """
                    SELECT
                        id,
                        email,
                        password_hash,
                        first_name,
                        last_name,
                        preferred_name,
                        status,
                        email_verified_at
                    FROM identity.users
                    WHERE email = ?
                    """,
                email
            );

        assertEquals(
            email,
            user.get("email")
        );

        assertEquals(
            "David",
            user.get("first_name")
        );

        assertEquals(
            "Ssali",
            user.get("last_name")
        );

        assertEquals(
            "Dave",
            user.get("preferred_name")
        );

        assertEquals(
            "ACTIVE",
            user.get("status")
        );

        assertNotNull(
            user.get("email_verified_at")
        );

        String passwordHash =
            (String) user.get(
                "password_hash"
            );

        assertTrue(
            passwordEncoder.matches(
                PASSWORD,
                passwordHash
            )
        );

        UUID userId =
            (UUID) user.get("id");

        assertNotNull(userId);

        Integer roleCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.user_roles ur
                    JOIN identity.application_roles role
                      ON role.id = ur.role_id
                    WHERE ur.user_id = ?
                      AND role.code = 'ROLE_USER'
                    """,
                Integer.class,
                userId
            );

        assertEquals(
            1,
            roleCount
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
            "Default categories should be provisioned"
        );

        Object consumedAt =
            jdbcTemplate.queryForObject(
                """
                    SELECT consumed_at
                    FROM identity.registration_requests
                    WHERE token_hash = ?
                    """,
                Object.class,
                tokenCodec.hash(token)
            );

        assertNotNull(
            consumedAt,
            "Successful registration must consume the token"
        );
    }


    @Test
    void completedUserCanLoginImmediately()
        throws Exception {

        String email =
            uniqueEmail("registration-login");

        startRegistration(email);

        String token =
            registrationEmailSender
                .tokenFor(email);

        completeRegistration(
            token,
            "David",
            "Ssali",
            null,
            PASSWORD
        )
            .andExpect(
                status().isCreated()
            );

        identityTestClient.login(
            email,
            PASSWORD
        );
    }


    @Test
    void registrationTokenCannotBeReused()
        throws Exception {

        String email =
            uniqueEmail("registration-replay");

        startRegistration(email);

        String token =
            registrationEmailSender
                .tokenFor(email);

        completeRegistration(
            token,
            "David",
            "Ssali",
            "Dave",
            PASSWORD
        )
            .andExpect(
                status().isCreated()
            );

        completeRegistration(
            token,
            "David",
            "Ssali",
            "Dave",
            PASSWORD
        )
            .andExpect(
                status().isBadRequest()
            )
            .andExpect(
                jsonPath("$.success")
                    .value(false)
            )
            .andExpect(
                jsonPath("$.message")
                    .value(
                        "Registration link is invalid or expired"
                    )
            );
    }


    @Test
    void expiredRegistrationTokenIsRejected()
        throws Exception {

        String email =
            uniqueEmail("registration-expired");

        startRegistration(email);

        String token =
            registrationEmailSender
                .tokenFor(email);

        String tokenHash =
            tokenCodec.hash(token);

        int updated =
            jdbcTemplate.update(
                """
                    UPDATE identity.registration_requests
                    SET created_at =
                            CURRENT_TIMESTAMP
                            - INTERVAL '2 days',
                        expires_at =
                            CURRENT_TIMESTAMP
                            - INTERVAL '1 day'
                    WHERE token_hash = ?
                    """,
                tokenHash
            );

        assertEquals(
            1,
            updated
        );

        completeRegistration(
            token,
            "David",
            "Ssali",
            null,
            PASSWORD
        )
            .andExpect(
                status().isBadRequest()
            )
            .andExpect(
                jsonPath("$.message")
                    .value(
                        "Registration link is invalid or expired"
                    )
            );

        Integer userCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.users
                    WHERE email = ?
                    """,
                Integer.class,
                email
            );

        assertEquals(
            0,
            userCount
        );
    }


    @Test
    void invalidRegistrationTokenIsRejected()
        throws Exception {

        Integer usersBefore =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.users
                    """,
                Integer.class
            );

        completeRegistration(
            "definitely-invalid-registration-token",
            "David",
            "Ssali",
            null,
            PASSWORD
        )
            .andExpect(
                status().isBadRequest()
            )
            .andExpect(
                jsonPath("$.success")
                    .value(false)
            );

        Integer usersAfter =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.users
                    """,
                Integer.class
            );

        assertEquals(
            usersBefore,
            usersAfter
        );
    }


    @Test
    void termsMustBeAcceptedAndFailedValidationDoesNotConsumeToken()
        throws Exception {

        String email =
            uniqueEmail("registration-terms");

        startRegistration(email);

        String token =
            registrationEmailSender
                .tokenFor(email);

        mockMvc.perform(
                post(
                    api(
                        "/auth/registration/complete"
                    )
                )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "token": "%s",
                              "firstName": "David",
                              "lastName": "Ssali",
                              "preferredName": "Dave",
                              "password": "%s",
                              "acceptTerms": false
                            }
                            """.formatted(
                            token,
                            PASSWORD
                        )
                    )
            )
            .andExpect(
                status().isBadRequest()
            )
            .andExpect(
                jsonPath(
                    "$.errors.acceptTerms"
                ).exists()
            );

        Map<String, Object> state =
            jdbcTemplate.queryForMap(
                """
                    SELECT
                        consumed_at,
                        invalidated_at
                    FROM identity.registration_requests
                    WHERE token_hash = ?
                    """,
                tokenCodec.hash(token)
            );

        assertNull(
            state.get("consumed_at")
        );

        assertNull(
            state.get("invalidated_at")
        );

        Integer userCount =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.users
                    WHERE email = ?
                    """,
                Integer.class,
                email
            );

        assertEquals(
            0,
            userCount
        );
    }


    @Test
    void duplicateAccountDuringCompletionDoesNotConsumeToken()
        throws Exception {

        String email =
            uniqueEmail("registration-race");

        startRegistration(email);

        String token =
            registrationEmailSender
                .tokenFor(email);

        /*
         * Simulate another account-creation path
         * winning the race after the registration
         * email was issued.
         */
        registerLegacyUser(
            email,
            PASSWORD
        );

        completeRegistration(
            token,
            "David",
            "Ssali",
            null,
            PASSWORD
        )
            .andExpect(
                status().isConflict()
            );

        Object consumedAt =
            jdbcTemplate.queryForObject(
                """
                    SELECT consumed_at
                    FROM identity.registration_requests
                    WHERE token_hash = ?
                    """,
                Object.class,
                tokenCodec.hash(token)
            );

        assertNull(
            consumedAt,
            "A failed completion must not consume the token"
        );
    }


    @Test
    void rejectsInvalidRegistrationStartEmail()
        throws Exception {

        mockMvc.perform(
                post(
                    api(
                        "/auth/registration/start"
                    )
                )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "email": "not-an-email"
                            }
                            """
                    )
            )
            .andExpect(
                status().isBadRequest()
            )
            .andExpect(
                jsonPath("$.success")
                    .value(false)
            )
            .andExpect(
                jsonPath("$.errors.email")
                    .exists()
            );
    }


    private void startRegistration(
        String email
    ) throws Exception {

        mockMvc.perform(
                post(
                    api(
                        "/auth/registration/start"
                    )
                )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "email": "%s"
                            }
                            """.formatted(
                            email
                        )
                    )
            )
            .andExpect(
                status().isAccepted()
            )
            .andExpect(
                jsonPath("$.success")
                    .value(true)
            )
            .andExpect(
                jsonPath("$.status")
                    .value(202)
            );
    }


    private org.springframework.test.web.servlet.ResultActions
    completeRegistration(
        String token,
        String firstName,
        String lastName,
        String preferredName,
        String password
    ) throws Exception {

        String preferredNameJson =
            preferredName == null
                ? "null"
                : "\"%s\"".formatted(
                preferredName
            );

        return mockMvc.perform(
            post(
                api(
                    "/auth/registration/complete"
                )
            )
                .contentType(
                    MediaType.APPLICATION_JSON
                )
                .content(
                    """
                        {
                          "token": "%s",
                          "firstName": "%s",
                          "lastName": "%s",
                          "preferredName": %s,
                          "password": "%s",
                          "acceptTerms": true
                        }
                        """.formatted(
                        token,
                        firstName,
                        lastName,
                        preferredNameJson,
                        password
                    )
                )
        );
    }


    private void registerLegacyUser(
        String email,
        String password
    ) throws Exception {

        mockMvc.perform(
                post(
                    api(
                        "/auth/register"
                    )
                )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content(
                        """
                            {
                              "email": "%s",
                              "password": "%s",
                              "firstName": "Existing",
                              "lastName": "User"
                            }
                            """.formatted(
                            email,
                            password
                        )
                    )
            )
            .andExpect(
                status().isCreated()
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
