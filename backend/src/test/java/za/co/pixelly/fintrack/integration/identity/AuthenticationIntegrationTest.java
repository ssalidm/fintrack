package za.co.pixelly.fintrack.integration.identity;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MvcResult;
import za.co.pixelly.fintrack.identity.application.OpaqueTokenCodec;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import static org.hamcrest.CoreMatchers.hasItem;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class AuthenticationIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private OpaqueTokenCodec refreshTokenCodec;

    @Autowired
    private JwtDecoder jwtDecoder;

    private final JsonParser jsonParser = new JacksonJsonParser();

    @Test
    void pendingVerificationUserCannotLogin() throws Exception {
        String email = uniqueEmail("pending");
        String password = "SecurePassword123!";

        registerUser(email, password);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "email": "%s",
                            "password": "%s"
                        }
                    """.formatted(email, password)))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.success").value(false));

    }

    @Test
    void loginRejectsIncorrectPassword() throws Exception {

        String email = uniqueEmail("wrong-password");

        registerUser(email, "SecurePassword123!");
        activateUser(email);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "%s",
                      "password": "DefinitelyWrong123!"
                    }
                    """.formatted(email)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Invalid email or password"));

    }

    @Test
    void loginCreatesSessionAndHashedRefreshToken() throws Exception {

        String email = uniqueEmail("login");
        String password = "SecurePassword123!";

        registerUser(email, password);
        activateUser(email);

        MvcResult result = login(email, password);

        String accessToken =
            resultField(result, "accessToken");

        String rawRefreshToken =
            resultField(result, "refreshToken");

        assertNotNull(accessToken);
        assertFalse(accessToken.isBlank());

        assertNotNull(rawRefreshToken);
        assertFalse(rawRefreshToken.isBlank());

        String refreshHash =
            refreshTokenCodec.hash(rawRefreshToken);

        Integer sessionCount = jdbcTemplate.queryForObject("""
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

        assertEquals(1, sessionCount);

        Integer tokenCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM identity.refresh_tokens
                WHERE token_hash = ?
                  AND consumed_at IS NULL
                  AND revoked_at IS NULL
                """,
            Integer.class,
            refreshHash
        );

        assertEquals(1, tokenCount);

        assertEquals(64, refreshHash.length());

        assertNotEquals(
            rawRefreshToken,
            refreshHash,
            "The raw refresh token must never be stored"
        );
    }

    @Test
    void accessTokenAuthenticatesProtectedRequest() throws Exception {

        String email = uniqueEmail("jwt");
        String password = "SecurePassword123!";

        registerUser(email, password);
        activateUser(email);

        MvcResult loginResult =
            login(email, password);

        String accessToken =
            resultField(loginResult, "accessToken");

        mockMvc.perform(get("/api/v1/auth/me")
                .header(
                    "Authorization",
                    "Bearer " + accessToken
                ))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").isNotEmpty())
            .andExpect(jsonPath("$.sessionId").isNotEmpty())
            .andExpect(jsonPath("$.roles", hasItem("ROLE_USER")));
    }

    @Test
    void protectedEndpointRejectsMissingAccessToken() throws Exception {

        mockMvc.perform(get("/api/v1/auth/me"))
            .andExpect(status().isUnauthorized());
    }

    private String uniqueEmail(String prefix) {
        return prefix + "+" + UUID.randomUUID() + "@test.com";
    }

    @Test
    void refreshRotatesTokenAndRejectsReplay() throws Exception {

        String email = uniqueEmail("refresh");
        String password = "SecurePassword123!";

        registerUser(email, password);
        activateUser(email);

        MvcResult loginResult =
            login(email, password);

        String oldRefreshToken =
            resultField(loginResult, "refreshToken");

        String oldHash =
            refreshTokenCodec.hash(oldRefreshToken);

        MvcResult refreshResult =
            mockMvc.perform(post("/api/v1/auth/refresh")
                    .contentType("application/json")
                    .content("""
                        {
                          "refreshToken": "%s"
                        }
                        """.formatted(oldRefreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.result.refreshToken").isNotEmpty())
                .andReturn();

        String newRefreshToken =
            resultField(
                refreshResult,
                "refreshToken"
            );

        assertNotEquals(
            oldRefreshToken,
            newRefreshToken
        );

        Map<String, Object> oldTokenState =
            jdbcTemplate.queryForMap("""
                    SELECT
                        consumed_at,
                        replaced_by_token_id
                    FROM identity.refresh_tokens
                    WHERE token_hash = ?
                    """,
                oldHash
            );

        assertNotNull(
            oldTokenState.get("consumed_at")
        );

        assertNotNull(
            oldTokenState.get("replaced_by_token_id")
        );

        String newHash =
            refreshTokenCodec.hash(newRefreshToken);

        Integer newTokenCount =
            jdbcTemplate.queryForObject("""
                    SELECT COUNT(*)
                    FROM identity.refresh_tokens
                    WHERE token_hash = ?
                      AND consumed_at IS NULL
                      AND revoked_at IS NULL
                    """,
                Integer.class,
                newHash
            );

        assertEquals(1, newTokenCount);


        // Replay the old refresh token.
        mockMvc.perform(post("/api/v1/auth/refresh")
                .contentType("application/json")
                .content("""
                    {
                      "refreshToken": "%s"
                    }
                    """.formatted(oldRefreshToken)))
            .andExpect(status().isUnauthorized());
    }

    private void registerUser(
        String email,
        String password
    ) throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                       "email": "%s",
                       "password": "%s",
                       "firstName": "David",
                       "lastName": "Test"
                    }
                    """.formatted(email, password)))
            .andExpect(status().isCreated());
    }

    private void activateUser(String email) {

        int updated = jdbcTemplate.update("""
                UPDATE identity.users
                   SET status = 'ACTIVE',
                       email_verified_at = CURRENT_TIMESTAMP
                 WHERE email = ?
                """,
            email
        );

        assertEquals(1, updated);
    }

    @Test
    void logoutRevokesSessionAndPreventsFurtherRefresh() throws Exception {

        String email = uniqueEmail("logout");
        String password = "SecurePassword123!";

        registerUser(email, password);
        activateUser(email);

        MvcResult loginResult =
            login(email, password);

        String accessToken =
            resultField(loginResult, "accessToken");

        String refreshToken =
            resultField(loginResult, "refreshToken");

        Jwt jwt =
            jwtDecoder.decode(accessToken);

        UUID sessionId =
            UUID.fromString(
                Objects.requireNonNull(jwt.getClaimAsString("sid"))
            );

        mockMvc.perform(post("/api/v1/auth/logout")
                .header(
                    "Authorization",
                    "Bearer " + accessToken
                ))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        Object revokedAt =
            jdbcTemplate.queryForObject("""
                    SELECT revoked_at
                    FROM identity.auth_sessions
                    WHERE id = ?
                    """,
                Object.class,
                sessionId
            );

        assertNotNull(revokedAt);

        String refreshHash =
            refreshTokenCodec.hash(refreshToken);

        Object tokenRevokedAt =
            jdbcTemplate.queryForObject("""
                    SELECT revoked_at
                    FROM identity.refresh_tokens
                    WHERE token_hash = ?
                    """,
                Object.class,
                refreshHash
            );

        assertNotNull(tokenRevokedAt);


        mockMvc.perform(post("/api/v1/auth/refresh")
                .contentType("application/json")
                .content("""
                    {
                      "refreshToken": "%s"
                    }
                    """.formatted(refreshToken)))
            .andExpect(status().isUnauthorized());
    }

    private MvcResult login(
        String email,
        String password
    ) throws Exception {

        return mockMvc.perform(post("/api/v1/auth/login")
                .header("User-Agent", "FinTrack integration test")
                .contentType("application/json")
                .content("""
                    {
                      "email": "%s",
                      "password": "%s"
                    }
                    """.formatted(email, password)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.result.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.result.refreshToken").isNotEmpty())
            .andExpect(jsonPath("$.result.tokenType").value("Bearer"))
            .andReturn();
    }

    @SuppressWarnings("unchecked")
    private String resultField(
        MvcResult result,
        String field
    ) throws Exception {

        Map<String, Object> root =
            jsonParser.parseMap(
                result.getResponse().getContentAsString()
            );

        Map<String, Object> body =
            (Map<String, Object>) root.get("result");

        return (String) body.get(field);
    }
}
