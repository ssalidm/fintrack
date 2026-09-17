package za.co.pixelly.fintrack.integration.support;

import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import za.co.pixelly.fintrack.config.security.ApiProperties;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class IdentityTestClient {

    public static final String DEFAULT_PASSWORD =
        "SecurePassword123!";

    private static final String DEFAULT_USER_AGENT =
        "FinTrack integration test";

    private final MockMvc mockMvc;
    private final TestEmailVerificationSender emailVerificationSender;
    private final JwtDecoder jwtDecoder;
    private final ApiProperties apiProperties;

    private final JsonParser jsonParser =
        new JacksonJsonParser();


    public IdentityTestClient(
        MockMvc mockMvc,
        TestEmailVerificationSender emailVerificationSender,
        JwtDecoder jwtDecoder,
        ApiProperties apiProperties
    ) {
        this.mockMvc = mockMvc;
        this.emailVerificationSender =
            emailVerificationSender;
        this.jwtDecoder = jwtDecoder;
        this.apiProperties = apiProperties;
    }


    public AuthenticatedUser createAuthenticatedUser(
        String prefix
    ) throws Exception {

        String email =
            "%s+%s@example.com"
                .formatted(
                    prefix,
                    UUID.randomUUID()
                );

        register(
            email,
            DEFAULT_PASSWORD
        );

        verifyEmail(email);

        return login(
            email,
            DEFAULT_PASSWORD
        );
    }


    public ResultActions loginRequest(
        String email,
        String password
    ) throws Exception {

        return loginRequest(
            email,
            password,
            DEFAULT_USER_AGENT
        );
    }


    public ResultActions loginRequest(
        String email,
        String password,
        String userAgent
    ) throws Exception {

        return mockMvc.perform(
            post(api("/auth/login"))
                .header(
                    "User-Agent",
                    userAgent
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
                    email,
                    password
                ))
        );
    }


    @SuppressWarnings("unchecked")
    public AuthenticatedUser login(
        String email,
        String password
    ) throws Exception {

        MvcResult result =
            loginRequest(
                email,
                password
            )
                .andExpect(
                    status().isOk()
                )
                .andReturn();

        Map<String, Object> root =
            jsonParser.parseMap(
                result.getResponse()
                    .getContentAsString()
            );

        Map<String, Object> response =
            (Map<String, Object>) root.get(
                "result"
            );

        Map<String, Object> tokens =
            (Map<String, Object>) response.get(
                "tokens"
            );

        String accessToken =
            (String) tokens.get(
                "accessToken"
            );

        String refreshToken =
            (String) tokens.get(
                "refreshToken"
            );

        Jwt jwt =
            jwtDecoder.decode(
                accessToken
            );

        UUID userId =
            UUID.fromString(
                Objects.requireNonNull(
                    jwt.getSubject()
                )
            );

        return new AuthenticatedUser(
            userId,
            email,
            accessToken,
            refreshToken
        );
    }


    public ResultActions verifyMfa(
        String challengeToken,
        String code
    ) throws Exception {

        return mockMvc.perform(
            post(
                api(
                    "/auth/mfa/verify"
                )
            )
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


    public ResultActions recoverMfa(
        String challengeToken,
        String recoveryCode
    ) throws Exception {

        return mockMvc.perform(
            post(
                api(
                    "/auth/mfa/recover"
                )
            )
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


    public ResultActions disableMfa(
        String accessToken,
        String currentPassword,
        String mfaCode
    ) throws Exception {

        return mockMvc.perform(
            post(
                api(
                    "/auth/mfa/disable"
                )
            )
                .header(
                    "Authorization",
                    "Bearer " + accessToken
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
                    currentPassword,
                    mfaCode
                ))
        );
    }


    public ResultActions regenerateRecoveryCodes(
        String accessToken,
        String currentPassword,
        String code
    ) throws Exception {

        return mockMvc.perform(
            post(
                api(
                    "/auth/mfa/recovery-codes/regenerate"
                )
            )
                .header(
                    "Authorization",
                    "Bearer " + accessToken
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
                    currentPassword,
                    code
                ))
        );
    }


    public ResultActions currentUser(
        String accessToken
    ) throws Exception {

        return mockMvc.perform(
            get(
                api(
                    "/auth/me"
                )
            )
                .header(
                    "Authorization",
                    "Bearer " + accessToken
                )
        );
    }


    public ResultActions mfaStatus(
        String accessToken
    ) throws Exception {

        return mockMvc.perform(
            get(
                api(
                    "/auth/mfa/status"
                )
            )
                .header(
                    "Authorization",
                    "Bearer " + accessToken
                )
        );
    }


    private void register(
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
                    .content("""
                        {
                          "email": "%s",
                          "password": "%s",
                          "firstName": "Integration",
                          "lastName": "Test"
                        }
                        """.formatted(
                        email,
                        password
                    ))
            )
            .andExpect(
                status().isCreated()
            );
    }


    private void verifyEmail(
        String email
    ) throws Exception {

        String verificationToken =
            emailVerificationSender
                .tokenFor(email);

        assertNotNull(
            verificationToken,
            "Registration should issue an email verification token"
        );

        mockMvc.perform(
                post(
                    api(
                        "/auth/verify-email"
                    )
                )
                    .contentType(
                        MediaType.APPLICATION_JSON
                    )
                    .content("""
                        {
                          "token": "%s"
                        }
                        """.formatted(
                        verificationToken
                    ))
            )
            .andExpect(
                status().isOk()
            );
    }


    private String api(
        String path
    ) {

        if (
            path == null
                || path.isBlank()
        ) {
            return apiProperties.basePath();
        }

        return path.startsWith("/")
            ? apiProperties.basePath() + path
            : apiProperties.basePath()
            + "/"
            + path;
    }
}
