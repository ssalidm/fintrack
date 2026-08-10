package za.co.pixelly.fintrack.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DatabaseSecurityIntegrationTest extends AbstractIntegrationTest {

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
