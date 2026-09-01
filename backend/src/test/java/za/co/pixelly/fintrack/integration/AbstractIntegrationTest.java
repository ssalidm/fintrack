package za.co.pixelly.fintrack.integration;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.postgresql.PostgreSQLContainer;
import za.co.pixelly.fintrack.integration.support.AuthenticatedUser;
import za.co.pixelly.fintrack.integration.support.IdentityTestClient;
import za.co.pixelly.fintrack.integration.support.TestEmailVerificationSender;
import za.co.pixelly.fintrack.integration.support.TestPasswordResetSender;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(AbstractIntegrationTest.TestMailConfiguration.class)
public abstract class AbstractIntegrationTest {

    private static final String FINTRACK_APPLICATION_USER = "fintrack_application";
    private static final String FINTRACK_APPLICATION_PASSWORD = "application-test-password";
    private static final String FINTRACK_MIGRATION_USER = "fintrack_migration";
    private static final String FINTRACK_MIGRATION_PASSWORD = "migration-test-password";


    protected static final PostgreSQLContainer POSTGRES =
        new PostgreSQLContainer("postgres:18-alpine")
            .withDatabaseName("fintrack_test_db")
            .withUsername("postgres")
            .withPassword("postgres")
            .withInitScript("test-db-init.sql");

    static {
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void configureDatabase(DynamicPropertyRegistry registry) {

        registry.add(
            "spring.datasource.url",
            POSTGRES::getJdbcUrl
        );

        registry.add(
            "spring.datasource.username",
            () -> FINTRACK_APPLICATION_USER
        );

        registry.add(
            "spring.datasource.password",
            () -> FINTRACK_APPLICATION_PASSWORD
        );

        registry.add(
            "spring.flyway.url",
            POSTGRES::getJdbcUrl
        );

        registry.add(
            "spring.flyway.user",
            () -> FINTRACK_MIGRATION_USER
        );

        registry.add(
            "spring.flyway.password",
            () -> FINTRACK_MIGRATION_PASSWORD
        );

        registry.add(
            "spring.flyway.default-schema",
            () -> "infra"
        );
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    @Autowired
    protected TestEmailVerificationSender emailSender;

    @Autowired
    protected TestPasswordResetSender passwordResetSender;

    @Autowired
    protected JwtDecoder jwtDecoder;

    protected IdentityTestClient identityTestClient;

    @BeforeEach
    void configureIdentityTestClient() {

        identityTestClient =
            new IdentityTestClient(
                mockMvc,
                emailSender,
                jwtDecoder
            );
    }

    protected AuthenticatedUser createAuthenticatedUser(
        String prefix
    ) throws Exception {
        return identityTestClient.createAuthenticatedUser(prefix);
    }

    protected AuthenticatedUser createAuthenticatedAdmin(
        String prefix
    ) throws Exception {

        AuthenticatedUser user = createAuthenticatedUser(prefix);

        jdbcTemplate.update(
            """
                INSERT INTO identity.user_roles (
                    user_id,
                    role_id,
                    assigned_at,
                    assigned_by_user_id
                )
                SELECT
                    ?,
                    role.id,
                    CURRENT_TIMESTAMP,
                    NULL
                FROM identity.application_roles role
                WHERE role.code = 'ROLE_ADMIN'
                ON CONFLICT (user_id, role_id)
                DO NOTHING
                """,
            user.userId()
        );

        /*
         * ROLE_ADMIN was assigned after the original JWT
         * was issued, so log in again to obtain a token
         * containing the new authority.
         */
        return identityTestClient.login(
            user.email(),
            IdentityTestClient.DEFAULT_PASSWORD
        );
    }


    @TestConfiguration(proxyBeanMethods = false)
    public static class TestMailConfiguration {

        @Autowired
        MockMvc mockMvc;

        @Bean
        TestEmailVerificationSender emailVerificationSender() {
            return new TestEmailVerificationSender();
        }

        @Bean
        TestPasswordResetSender passwordResetSender() {
            return new TestPasswordResetSender();
        }

    }
}
