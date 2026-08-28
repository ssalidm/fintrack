package za.co.pixelly.fintrack.integration.identity;

import org.junit.jupiter.api.Test;
import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.boot.json.JsonParser;
import org.springframework.test.web.servlet.ResultActions;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;
import za.co.pixelly.fintrack.integration.support.AuthenticatedUser;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.junit.jupiter.api.Assertions.assertEquals;


class UserProfileIntegrationTest extends AbstractIntegrationTest {


    private static final String CURRENT_PASSWORD = "SecurePassword123!";
    private static final String NEW_PASSWORD = "NewSecurePassword456!";
    private static final JsonParser jsonParser = new JacksonJsonParser();


    @Test
    void authenticatedUserCanViewProfile()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "profile-read"
            );

        mockMvc.perform(
                get("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.id")
                    .value(user.userId().toString())
            )
            .andExpect(
                jsonPath("$.result.email")
                    .value(user.email())
            )
            .andExpect(
                jsonPath("$.result.status")
                    .value("ACTIVE")
            )
            .andExpect(
                jsonPath("$.result.emailVerified")
                    .value(true)
            )
            .andExpect(
                jsonPath("$.result.roles[0]")
                    .value("ROLE_USER")
            )
            .andExpect(
                jsonPath("$.result.passwordHash")
                    .doesNotExist()
            )
            .andExpect(
                jsonPath("$.result.failedLoginAttempts")
                    .doesNotExist()
            )
            .andExpect(
                jsonPath("$.result.lockedUntil")
                    .doesNotExist()
            );
    }


    @Test
    void authenticatedUserCanUpdateOwnProfile()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "profile-update"
            );

        MvcResult currentProfile =
            mockMvc.perform(
                    get("/api/v1/profile")
                        .header(
                            "Authorization",
                            bearer(user)
                        )
                )
                .andExpect(status().isOk())
                .andReturn();

        long version = profileVersion(user);

        mockMvc.perform(
                patch("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "version": %d,
                          "firstName": "Updated",
                          "lastName": "Profile"
                        }
                        """.formatted(version))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.firstName")
                    .value("Updated")
            )
            .andExpect(
                jsonPath("$.result.lastName")
                    .value("Profile")
            )
            .andExpect(
                jsonPath("$.result.version")
                    .value(version + 1)
            );
    }


    @Test
    void staleProfileVersionIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "profile-stale"
            );

        MvcResult currentProfile =
            mockMvc.perform(
                    get("/api/v1/profile")
                        .header(
                            "Authorization",
                            bearer(user)
                        )
                )
                .andExpect(status().isOk())
                .andReturn();

        long version = profileVersion(user);

        mockMvc.perform(
                patch("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "version": %d,
                          "firstName": "First Update"
                        }
                        """.formatted(version))
            )
            .andExpect(status().isOk());


        mockMvc.perform(
                patch("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "version": %d,
                          "firstName": "Stale Update"
                        }
                        """.formatted(version))
            )
            .andExpect(
                status().isConflict()
            );
    }


    @Test
    void blankProfileNamesAreRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "profile-validation"
            );

        mockMvc.perform(
                patch("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "version": 0,
                          "firstName": "   "
                        }
                        """)
            )
            .andExpect(
                status().isBadRequest()
            );
    }


    @Test
    void authenticatedUserCanChangePasswordAndExistingSessionIsRevoked()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "profile-password-change"
            );


        changePassword(
            user,
            CURRENT_PASSWORD,
            NEW_PASSWORD
        )
            .andExpect(status().isOk());


        /*
         * The JWT itself is still correctly signed and
         * unexpired, but its sid now points to a revoked
         * auth session.
         */
        mockMvc.perform(
                get("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(
                status().isUnauthorized()
            );


        /*
         * All active authentication sessions belonging
         * to the user must have been revoked.
         */
        Integer activeSessions =
            jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM identity.auth_sessions
                WHERE user_id = ?
                  AND revoked_at IS NULL
                """,
                Integer.class,
                user.userId()
            );

        assertEquals(
            0,
            activeSessions
        );


        /*
         * All outstanding refresh tokens must also
         * have been revoked.
         */
        Integer activeRefreshTokens =
            jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM identity.refresh_tokens
                WHERE user_id = ?
                  AND revoked_at IS NULL
                  AND consumed_at IS NULL
                """,
                Integer.class,
                user.userId()
            );

        assertEquals(
            0,
            activeRefreshTokens
        );


        /*
         * The old password can no longer authenticate.
         */
        login(
            user.email(),
            CURRENT_PASSWORD
        )
            .andExpect(
                status().isUnauthorized()
            );


        /*
         * The new password must authenticate successfully
         * and create a fresh session.
         */
        MvcResult loginResult =
            login(
                user.email(),
                NEW_PASSWORD
            )
                .andExpect(status().isOk())
                .andReturn();


        String newAccessToken =
            accessTokenFrom(
                loginResult
            );


        /*
         * The freshly-created session and JWT must work.
         */
        mockMvc.perform(
                get("/api/v1/profile")
                    .header(
                        "Authorization",
                        "Bearer " + newAccessToken
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.id")
                    .value(
                        user.userId().toString()
                    )
            );
    }


    @Test
    void incorrectCurrentPasswordIsRejected()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "profile-password-wrong"
            );


        changePassword(
            user,
            "WrongPassword123!",
            NEW_PASSWORD
        )
            .andExpect(
                status().isBadRequest()
            );


        /*
         * Failed password change must NOT revoke the
         * existing authenticated session.
         */
        mockMvc.perform(
                get("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk());


        /*
         * Original password must remain valid.
         */
        login(
            user.email(),
            CURRENT_PASSWORD
        )
            .andExpect(status().isOk());
    }


    @Test
    void currentPasswordCannotBeReusedAsNewPassword()
        throws Exception {

        AuthenticatedUser user =
            createAuthenticatedUser(
                "profile-password-reuse"
            );


        changePassword(
            user,
            CURRENT_PASSWORD,
            CURRENT_PASSWORD
        )
            .andExpect(
                status().isConflict()
            );


        /*
         * Existing session must remain valid because
         * no password change actually occurred.
         */
        mockMvc.perform(
                get("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(status().isOk());
    }

    @Test
    void changePasswordRequiresAuthentication()
        throws Exception {

        mockMvc.perform(
                post(
                    "/api/v1/profile/change-password"
                )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                    {
                      "currentPassword": "%s",
                      "newPassword": "%s"
                    }
                    """.formatted(
                        CURRENT_PASSWORD,
                        NEW_PASSWORD
                    ))
            )
            .andExpect(
                status().isUnauthorized()
            );
    }


    @Test
    void profileRequiresAuthentication()
        throws Exception {

        mockMvc.perform(
                get("/api/v1/profile")
            )
            .andExpect(
                status().isUnauthorized()
            );
    }


    private long profileVersion(
        AuthenticatedUser user
    ) {
        Long version = jdbcTemplate.queryForObject(
            """
                SELECT version
                FROM identity.users
                WHERE id = ?
                """,
            Long.class,
            user.userId()
        );

        if (version == null) {
            throw new IllegalStateException(
                "User profile version was not found"
            );
        }

        return version;
    }


    private ResultActions changePassword(
        AuthenticatedUser user,
        String currentPassword,
        String newPassword
    ) throws Exception {

        return mockMvc.perform(
            post(
                "/api/v1/profile/change-password"
            )
                .header(
                    "Authorization",
                    bearer(user)
                )
                .contentType(
                    "application/json"
                )
                .content("""
                {
                  "currentPassword": "%s",
                  "newPassword": "%s"
                }
                """.formatted(
                    currentPassword,
                    newPassword
                ))
        );
    }


    private ResultActions login(
        String email,
        String password
    ) throws Exception {

        return mockMvc.perform(
            post("/api/v1/auth/login")
                .header(
                    "User-Agent",
                    "FinTrack profile integration test"
                )
                .contentType(
                    "application/json"
                )
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


    @SuppressWarnings("unchecked")
    private String accessTokenFrom(
        MvcResult result
    ) throws Exception {

        Map<String, Object> root =
            jsonParser.parseMap(
                result
                    .getResponse()
                    .getContentAsString()
            );

        Map<String, Object> response =
            (Map<String, Object>)
                root.get("result");

        return (String)
            response.get(
                "accessToken"
            );
    }


    private String bearer(
        AuthenticatedUser user
    ) {
        return "Bearer "
            + user.accessToken();
    }
}
