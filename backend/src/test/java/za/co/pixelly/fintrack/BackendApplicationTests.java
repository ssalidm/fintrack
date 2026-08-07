package za.co.pixelly.fintrack;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
@SpringBootTest
@ActiveProfiles("test")
class BackendApplicationTests {

    private static final String FINTRACK_APPLICATION_USER = "fintrack_application";
    private static final String FINTRACK_APPLICATION_PASSWORD = "application-test-password";
    private static final String FINTRACK_MIGRATION_USER = "fintrack_migration";
    private static final String FINTRACK_MIGRATION_PASSWORD = "migration-test-password";

    @Container
    static final PostgreSQLContainer POSTGRES =
        new PostgreSQLContainer("postgres:18-alpine")
            .withDatabaseName("fintrack_test_db")
            .withUsername("postgres")
            .withPassword("postgres")
            .withInitScript("test-db-init.sql");

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
    private DataSource dataSource;

    @Test
    void contextLoads() {

    }

    @Test
    void applicationDataSourceUsesLeastPrivilegeRole() throws Exception {

        try (
            Connection connection = dataSource.getConnection();
            Statement statement = connection.createStatement();
            ResultSet result = statement.executeQuery("""
                SELECT
                    current_user,
                    has_schema_privilege(
                        current_user,
                        'finance',
                        'CREATE'
                    ),
                    has_schema_privilege(
                        current_user,
                        'infra',
                        'USAGE'
                    )
                """)
        ) {

            assertTrue(result.next());

            assertEquals(
                "fintrack_application",
                result.getString(1)
            );

            assertFalse(result.getBoolean(2));
            assertFalse(result.getBoolean(3));
        }
    }

    @Test
    void migrationsPreserveOwnershipBoundaries() throws Exception {

        try (
            Connection connection = DriverManager.getConnection(
                POSTGRES.getJdbcUrl(),
                POSTGRES.getUsername(),
                POSTGRES.getPassword()
            );
            Statement statement = connection.createStatement();
            ResultSet result = statement.executeQuery("""
                SELECT
                    (
                        SELECT tableowner
                        FROM pg_tables
                        WHERE schemaname = 'infra'
                            AND tablename = 'flyway_schema_history'
                    ),
                    (
                        SELECT tableowner
                        FROM pg_tables
                        WHERE schemaname = 'identity'
                            AND tablename = 'users'
                    )
                """)
        ) {

            assertTrue(result.next());

            assertEquals(
                "fintrack_migration",
                result.getString(1)
            );

            assertEquals(
                "fintrack_owner",
                result.getString(2)
            );
        }
    }
}
