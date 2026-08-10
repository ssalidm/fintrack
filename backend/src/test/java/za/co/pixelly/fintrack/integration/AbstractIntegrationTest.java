package za.co.pixelly.fintrack.integration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.postgresql.PostgreSQLContainer;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
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
}
