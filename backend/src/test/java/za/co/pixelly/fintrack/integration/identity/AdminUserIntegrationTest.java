package za.co.pixelly.fintrack.integration.identity;

import org.junit.jupiter.api.Test;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;
import za.co.pixelly.fintrack.integration.support.AuthenticatedUser;
import za.co.pixelly.fintrack.integration.support.IdentityTestClient;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AdminUserIntegrationTest
    extends AbstractIntegrationTest {


    @Test
    void ordinaryUserCannotAccessAdminEndpoints()
        throws Exception {

        AuthenticatedUser user = createAuthenticatedUser(
            "admin-forbidden"
        );

        mockMvc.perform(
                get("/api/v1/admin/users")
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(
                status().isForbidden()
            );
    }


    @Test
    void adminCanListUsers()
        throws Exception {

        AuthenticatedUser admin = createAuthenticatedAdmin(
            "admin-list"
        );

        /*
         * Create another ordinary user so the admin
         * listing contains more than the admin itself.
         */
        AuthenticatedUser ordinaryUser = createAuthenticatedUser(
            "admin-list-user"
        );


        mockMvc.perform(
                get("/api/v1/admin/users")
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.items")
                    .isArray()
            )
            .andExpect(
                jsonPath("$.result.page")
                    .value(0)
            )
            .andExpect(
                jsonPath("$.result.size")
                    .value(25)
            )
            .andExpect(
                jsonPath("$.result.totalElements")
                    .isNumber()
            )
            .andExpect(
                jsonPath(
                    "$.result.items[?(@.email == '%s')]",
                    admin.email()
                )
                    .exists()
            )
            .andExpect(
                jsonPath(
                    "$.result.items[?(@.email == '%s')]",
                    ordinaryUser.email()
                )
                    .exists()
            );
    }


    @Test
    void adminListIncludesPersistedRoles()
        throws Exception {

        AuthenticatedUser admin = createAuthenticatedAdmin(
            "admin-roles"
        );


        mockMvc.perform(
                get("/api/v1/admin/users")
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.result.items[?(@.email == '%s')].roles",
                    admin.email()
                )
                    .exists()
            );
    }


    @Test
    void adminCanViewSpecificUser()
        throws Exception {

        AuthenticatedUser admin = createAuthenticatedAdmin(
            "admin-user-read"
        );

        AuthenticatedUser target = createAuthenticatedUser(
            "admin-user-target"
        );


        mockMvc.perform(
                get(
                    "/api/v1/admin/users/{userId}",
                    target.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.id")
                    .value(
                        target.userId()
                            .toString()
                    )
            )
            .andExpect(
                jsonPath("$.result.email")
                    .value(
                        target.email()
                    )
            )
            .andExpect(
                jsonPath("$.result.status")
                    .value("ACTIVE")
            )
            .andExpect(
                jsonPath("$.result.roles[0]")
                    .value("ROLE_USER")
            )
            .andExpect(
                jsonPath("$.result.passwordHash")
                    .doesNotExist()
            );
    }


    @Test
    void ordinaryUserCannotViewAdminUserDetails()
        throws Exception {

        AuthenticatedUser user = createAuthenticatedUser(
            "admin-detail-forbidden"
        );

        AuthenticatedUser target = createAuthenticatedUser(
            "admin-detail-target"
        );


        mockMvc.perform(
                get(
                    "/api/v1/admin/users/{userId}",
                    target.userId()
                )
                    .header(
                        "Authorization",
                        bearer(user)
                    )
            )
            .andExpect(
                status().isForbidden()
            );
    }


    @Test
    void adminGetsNotFoundForUnknownUser()
        throws Exception {

        AuthenticatedUser admin = createAuthenticatedAdmin(
            "admin-user-missing"
        );


        mockMvc.perform(
                get(
                    "/api/v1/admin/users/{userId}",
                    UUID.randomUUID()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
            )
            .andExpect(
                status().isNotFound()
            );
    }


    @Test
    void adminCanDeactivateOrdinaryUser()
        throws Exception {

        AuthenticatedUser admin = createAuthenticatedAdmin(
            "admin-deactivate"
        );

        AuthenticatedUser target = createAuthenticatedUser(
            "admin-deactivate-target"
        );

        long version = userVersion(
            target.userId()
        );


        mockMvc.perform(
                post(
                    "/api/v1/admin/users/{userId}/deactivate",
                    target.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "version": %d
                        }
                        """.formatted(version))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.status")
                    .value("DEACTIVATED")
            );


        /*
         * The target user's old JWT must immediately
         * become invalid because its session is revoked.
         */
        mockMvc.perform(
                get("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(target)
                    )
            )
            .andExpect(
                status().isUnauthorized()
            );
    }


    @Test
    void adminCannotDeactivateAnotherAdmin()
        throws Exception {

        AuthenticatedUser admin =
            createAuthenticatedAdmin(
                "admin-peer-source"
            );

        AuthenticatedUser otherAdmin =
            createAuthenticatedAdmin(
                "admin-peer-target"
            );

        long version =
            userVersion(
                otherAdmin.userId()
            );


        mockMvc.perform(
                post(
                    "/api/v1/admin/users/{userId}/deactivate",
                    otherAdmin.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "version": %d
                        }
                        """.formatted(version))
            )
            .andExpect(
                status().isForbidden()
            );


        /*
         * Failed admin operation must not revoke the
         * other administrator's session.
         */
        mockMvc.perform(
                get("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(otherAdmin)
                    )
            )
            .andExpect(status().isOk());
    }


    @Test
    void adminCannotDeactivateOwnAccountThroughAdminApi()
        throws Exception {

        AuthenticatedUser admin =
            createAuthenticatedAdmin(
                "admin-self-deactivate"
            );

        long version =
            userVersion(
                admin.userId()
            );


        mockMvc.perform(
                post(
                    "/api/v1/admin/users/{userId}/deactivate",
                    admin.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "version": %d
                        }
                        """.formatted(version))
            )
            .andExpect(
                status().isForbidden()
            );
    }


    @Test
    void adminCanActivateDeactivatedUser()
        throws Exception {

        AuthenticatedUser admin =
            createAuthenticatedAdmin(
                "admin-activate"
            );

        AuthenticatedUser target =
            createAuthenticatedUser(
                "admin-activate-target"
            );


        long activeVersion =
            userVersion(
                target.userId()
            );


        /*
         * First deactivate the target.
         */
        mockMvc.perform(
                post(
                    "/api/v1/admin/users/{userId}/deactivate",
                    target.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "version": %d
                        }
                        """.formatted(
                        activeVersion
                    ))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.status")
                    .value("DEACTIVATED")
            );


        long deactivatedVersion =
            userVersion(
                target.userId()
            );


        /*
         * Now reactivate the user.
         */
        mockMvc.perform(
                post(
                    "/api/v1/admin/users/{userId}/activate",
                    target.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "version": %d
                        }
                        """.formatted(
                        deactivatedVersion
                    ))
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.status")
                    .value("ACTIVE")
            );

        mockMvc.perform(
                get("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(target)
                    )
            )
            .andExpect(
                status().isUnauthorized()
            );
    }


    @Test
    void activeUserCannotBeActivated()
        throws Exception {

        AuthenticatedUser admin =
            createAuthenticatedAdmin(
                "admin-activate-active"
            );

        AuthenticatedUser target =
            createAuthenticatedUser(
                "admin-activate-target"
            );

        long version = userVersion(target.userId());


        mockMvc.perform(
                post(
                    "/api/v1/admin/users/{userId}/activate",
                    target.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "version": %d
                        }
                        """.formatted(
                        version
                    ))
            )
            .andExpect(
                status().isConflict()
            );
    }


    @Test
    void adminCannotActivateAnotherAdmin()
        throws Exception {

        AuthenticatedUser admin =
            createAuthenticatedAdmin(
                "admin-activate-peer-source"
            );

        AuthenticatedUser otherAdmin =
            createAuthenticatedAdmin(
                "admin-activate-peer-target"
            );

        long version =
            userVersion(
                otherAdmin.userId()
            );


        mockMvc.perform(
                post(
                    "/api/v1/admin/users/{userId}/activate",
                    otherAdmin.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
                    .contentType(
                        "application/json"
                    )
                    .content("""
                        {
                          "version": %d
                        }
                        """.formatted(
                        version
                    ))
            )
            .andExpect(
                status().isForbidden()
            );
    }


    @Test
    void adminCanViewOrdinaryUserSessions()
        throws Exception {

        AuthenticatedUser admin =
            createAuthenticatedAdmin(
                "admin-session-read"
            );

        AuthenticatedUser target =
            createAuthenticatedUser(
                "admin-session-target"
            );


        mockMvc.perform(
                get(
                    "/api/v1/admin/users/{userId}/sessions",
                    target.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
            )
            .andExpect(status().isOk())
            .andExpect(
                jsonPath("$.result.items")
                    .isArray()
            )
            .andExpect(
                jsonPath("$.result.items[0].id")
                    .isNotEmpty()
            )
            .andExpect(
                jsonPath("$.result.items[0].createdAt")
                    .isNotEmpty()
            )
            .andExpect(
                jsonPath("$.result.items[0].expiresAt")
                    .isNotEmpty()
            )
            .andExpect(
                jsonPath("$.result.items[0].active")
                    .value(true)
            )
            .andExpect(
                jsonPath("$.result.items[0].userAgent")
                    .value(
                        "FinTrack integration test"
                    )
            )
            .andExpect(
                jsonPath("$.result.page")
                    .value(0)
            )
            .andExpect(
                jsonPath("$.result.size")
                    .value(25)
            );
    }


    @Test
    void adminCannotViewAnotherAdminsSessions()
        throws Exception {

        AuthenticatedUser admin =
            createAuthenticatedAdmin(
                "admin-session-peer-source"
            );

        AuthenticatedUser otherAdmin =
            createAuthenticatedAdmin(
                "admin-session-peer-target"
            );


        mockMvc.perform(
                get(
                    "/api/v1/admin/users/{userId}/sessions",
                    otherAdmin.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
            )
            .andExpect(
                status().isForbidden()
            );
    }


    @Test
    void adminCannotViewOwnSessionsThroughAdminApi()
        throws Exception {

        AuthenticatedUser admin =
            createAuthenticatedAdmin(
                "admin-session-self"
            );


        mockMvc.perform(
                get(
                    "/api/v1/admin/users/{userId}/sessions",
                    admin.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
            )
            .andExpect(
                status().isForbidden()
            );
    }


    @Test
    void adminGetsNotFoundWhenViewingSessionsForUnknownUser()
        throws Exception {

        AuthenticatedUser admin =
            createAuthenticatedAdmin(
                "admin-session-missing"
            );


        mockMvc.perform(
                get(
                    "/api/v1/admin/users/{userId}/sessions",
                    UUID.randomUUID()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
            )
            .andExpect(
                status().isNotFound()
            );
    }


    @Test
    void adminCanRevokeOrdinaryUserSessions()
        throws Exception {

        AuthenticatedUser admin =
            createAuthenticatedAdmin(
                "admin-revoke-sessions"
            );

        AuthenticatedUser target =
            createAuthenticatedUser(
                "admin-revoke-target"
            );


        mockMvc.perform(
                post(
                    "/api/v1/admin/users/{userId}/revoke-sessions",
                    target.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
            )
            .andExpect(status().isOk());


        /*
         * Existing JWT becomes invalid immediately
         * because its sid now points to a revoked session.
         */
        mockMvc.perform(
                get("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(target)
                    )
            )
            .andExpect(
                status().isUnauthorized()
            );


        Integer activeSessions =
            jdbcTemplate.queryForObject(
                """
                    SELECT COUNT(*)
                    FROM identity.auth_sessions
                    WHERE user_id = ?
                      AND revoked_at IS NULL
                    """,
                Integer.class,
                target.userId()
            );

        assertEquals(
            0,
            activeSessions
        );


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
                target.userId()
            );

        assertEquals(
            0,
            activeRefreshTokens
        );

        String userStatus =
            jdbcTemplate.queryForObject(
                """
                    SELECT status
                    FROM identity.users
                    WHERE id = ?
                    """,
                String.class,
                target.userId()
            );

        assertEquals(
            "ACTIVE",
            userStatus
        );

        AuthenticatedUser freshLogin =
            identityTestClient.login(
                target.email(),
                IdentityTestClient.DEFAULT_PASSWORD
            );

        mockMvc.perform(
                get("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(freshLogin)
                    )
            )
            .andExpect(
                status().isOk()
            );
    }


    @Test
    void adminCannotRevokeAnotherAdminsSessions()
        throws Exception {

        AuthenticatedUser admin =
            createAuthenticatedAdmin(
                "admin-revoke-peer-source"
            );

        AuthenticatedUser otherAdmin =
            createAuthenticatedAdmin(
                "admin-revoke-peer-target"
            );


        mockMvc.perform(
                post(
                    "/api/v1/admin/users/{userId}/revoke-sessions",
                    otherAdmin.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
            )
            .andExpect(
                status().isForbidden()
            );


        /*
         * Failed operation must not invalidate the other
         * administrator's session.
         */
        mockMvc.perform(
                get("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(otherAdmin)
                    )
            )
            .andExpect(status().isOk());
    }


    @Test
    void adminCannotRevokeOwnSessionsThroughAdminApi()
        throws Exception {

        AuthenticatedUser admin =
            createAuthenticatedAdmin(
                "admin-revoke-self"
            );


        mockMvc.perform(
                post(
                    "/api/v1/admin/users/{userId}/revoke-sessions",
                    admin.userId()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
            )
            .andExpect(
                status().isForbidden()
            );


        mockMvc.perform(
                get("/api/v1/profile")
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
            )
            .andExpect(status().isOk());
    }


    @Test
    void adminGetsNotFoundWhenRevokingUnknownUserSessions()
        throws Exception {

        AuthenticatedUser admin =
            createAuthenticatedAdmin(
                "admin-revoke-missing"
            );


        mockMvc.perform(
                post(
                    "/api/v1/admin/users/{userId}/revoke-sessions",
                    UUID.randomUUID()
                )
                    .header(
                        "Authorization",
                        bearer(admin)
                    )
            )
            .andExpect(
                status().isNotFound()
            );
    }


    @Test
    void adminEndpointRequiresAuthentication()
        throws Exception {

        mockMvc.perform(
                get("/api/v1/admin/users")
            )
            .andExpect(
                status().isUnauthorized()
            );
    }


    private String bearer(
        AuthenticatedUser user
    ) {
        return "Bearer "
            + user.accessToken();
    }


    private long userVersion(
        UUID userId
    ) {

        Long version =
            jdbcTemplate.queryForObject(
                """
                    SELECT version
                    FROM identity.users
                    WHERE id = ?
                    """,
                Long.class,
                userId
            );

        if (version == null) {
            throw new IllegalStateException(
                "User version was not found"
            );
        }

        return version;
    }
}
