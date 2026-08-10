//package za.co.pixelly.fintrack;
//
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
//import org.springframework.http.MediaType;
//import org.springframework.jdbc.core.JdbcTemplate;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.test.context.ActiveProfiles;
//import org.springframework.test.context.DynamicPropertyRegistry;
//import org.springframework.test.context.DynamicPropertySource;
//import org.springframework.test.web.servlet.MockMvc;
//import org.testcontainers.junit.jupiter.Container;
//import org.testcontainers.junit.jupiter.Testcontainers;
//import org.testcontainers.postgresql.PostgreSQLContainer;
//
//import javax.sql.DataSource;
//import java.sql.Connection;
//import java.sql.DriverManager;
//import java.sql.ResultSet;
//import java.sql.Statement;
//import java.util.UUID;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@Testcontainers
//@SpringBootTest
//@ActiveProfiles("test")
//@AutoConfigureMockMvc
//class BackendApplicationTests {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private JdbcTemplate jdbcTemplate;
//
//
//
//
//
//
//
//    @Test
//    void logsInUserAndIssuesAccessAndRefreshTokens() throws Exception {
//
//        String email =
//            "david+" + UUID.randomUUID() + "@test.com";
//
//        String payload = """
//            {
//              "email": "%s",
//              "password": "SecurePassword123!",
//              "firstName": "David",
//              "lastName": "Ssali"
//            }
//            """.formatted(email);
//
//        mockMvc.perform(post("/api/v1/auth/register")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(payload))
//            .andExpect(status().isCreated());
//
//        jdbcTemplate.update("""
//                UPDATE identity.users
//                SET status = 'ACTIVE',
//                    email_verified_at = CURRENT_TIMESTAMP
//                WHERE email = ?
//                """,
//            email
//        );
//
//        String loginRequest = """
//            {
//                "email": "%s",
//                "password": "SecurePassword123!"
//            }
//            """.formatted(email);
//
//        mockMvc.perform(post("/api/v1/auth/login")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(loginRequest))
//            .andExpect(status().isOk())
//            .andExpect(jsonPath("$.result.accessToken").isNotEmpty())
//            .andExpect(jsonPath("$.result.refreshToken").isNotEmpty())
//            .andReturn();
//    }
//
//}
