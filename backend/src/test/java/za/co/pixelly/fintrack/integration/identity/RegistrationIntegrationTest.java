package za.co.pixelly.fintrack.integration.identity;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import za.co.pixelly.fintrack.integration.AbstractIntegrationTest;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class RegistrationIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    PasswordEncoder passwordEncoder;

    @Test
    void registersUserAndAssignsDefaultRole() throws Exception {

        String email =
            "david+" + UUID.randomUUID() + "@test.com";

        String password = "SecurePassword123!";

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "email": "%s",
                        "password": "%s",
                        "firstName": "David",
                        "lastName": "Ssali"
                    }
                    """.formatted(email, password)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.status").value(201))
            .andExpect(jsonPath("$.result.email").value(email))
            .andExpect(jsonPath("$.result.firstName").value("David"))
            .andExpect(jsonPath("$.result.lastName").value("Ssali"))
            .andExpect(jsonPath("$.result.status").value("PENDING_VERIFICATION"));

        String passwordHash = jdbcTemplate.queryForObject(
            """
                SELECT password_hash
                FROM identity.users
                WHERE email = ?
                """,
            String.class,
            email
        );

        assertTrue(passwordEncoder.matches(password, passwordHash));

        Integer roleCount = jdbcTemplate.queryForObject(
            """
                SELECT COUNT(*)
                FROM identity.user_roles ur
                JOIN identity.users u
                    ON u.id = ur.user_id
                JOIN identity.application_roles r
                    ON r.id = ur.role_id
                WHERE u.email = ?
                    AND r.code = 'ROLE_USER'
                """,
            Integer.class,
            email
        );

        assertEquals(1, roleCount);
    }

    @Test
    void rejectsDuplicateEmail() throws Exception {

        String email =
            "duplicate+" + UUID.randomUUID() + "@example.com";

        String payload = """
            {
              "email": "%s",
              "password": "SecurePassword123!",
              "firstName": "David",
              "lastName": "Ssali"
            }
            """.formatted(email);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void rejectsInvalidRegistrationRequest() throws Exception {

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "invalid-email",
                      "password": "short",
                      "firstName": "",
                      "lastName": ""
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.errors.email").exists())
            .andExpect(jsonPath("$.errors.password").exists())
            .andExpect(jsonPath("$.errors.firstName").exists())
            .andExpect(jsonPath("$.errors.lastName").exists());
    }
}
