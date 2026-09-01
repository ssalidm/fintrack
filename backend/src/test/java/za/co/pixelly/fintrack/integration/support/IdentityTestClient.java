package za.co.pixelly.fintrack.integration.support;

import org.springframework.boot.json.JacksonJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class IdentityTestClient {

    public static final String DEFAULT_PASSWORD = "SecurePassword123!";

    private final MockMvc mockMvc;
    private final TestEmailVerificationSender emailVerificationSender;
    private final JwtDecoder jwtDecoder;

    private final JsonParser jsonParser =
        new JacksonJsonParser();

    public IdentityTestClient(
        MockMvc mockMvc,
        TestEmailVerificationSender emailVerificationSender,
        JwtDecoder jwtDecoder
    ) {
        this.mockMvc = mockMvc;
        this.emailVerificationSender =
            emailVerificationSender;
        this.jwtDecoder = jwtDecoder;
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

        register(email, DEFAULT_PASSWORD);

        verifyEmail(email);

        return login(
            email,
            DEFAULT_PASSWORD
        );
    }

    private void register(
        String email,
        String password
    ) throws Exception {

        mockMvc.perform(
                post("/api/v1/auth/register")
                    .contentType("application/json")
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
            .andExpect(status().isCreated());
    }

    private void verifyEmail(
        String email
    ) throws Exception {

        String verificationToken =
            emailVerificationSender.tokenFor(email);

        assertNotNull(
            verificationToken,
            "Registration should issue an email verification token"
        );

        mockMvc.perform(
                post("/api/v1/auth/verify-email")
                    .contentType("application/json")
                    .content("""
                        {
                          "token": "%s"
                        }
                        """.formatted(
                        verificationToken
                    ))
            )
            .andExpect(status().isOk());
    }

    @SuppressWarnings("unchecked")
    public AuthenticatedUser login(
        String email,
        String password
    ) throws Exception {

        MvcResult result =
            mockMvc.perform(
                    post("/api/v1/auth/login")
                        .header(
                            "User-Agent",
                            "FinTrack integration test"
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
                )
                .andExpect(status().isOk())
                .andReturn();

        Map<String, Object> root =
            jsonParser.parseMap(
                result.getResponse()
                    .getContentAsString()
            );

        Map<String, Object> response =
            (Map<String, Object>) root.get("result");

        String accessToken =
            (String) response.get("accessToken");

        String refreshToken =
            (String) response.get("refreshToken");

        Jwt jwt =
            jwtDecoder.decode(accessToken);

        UUID userId =
            UUID.fromString(
                Objects.requireNonNull(jwt.getSubject())
            );

        return new AuthenticatedUser(
            userId,
            email,
            accessToken,
            refreshToken
        );
    }
}
