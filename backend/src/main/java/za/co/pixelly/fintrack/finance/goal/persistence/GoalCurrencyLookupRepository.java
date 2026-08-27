package za.co.pixelly.fintrack.finance.goal.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class GoalCurrencyLookupRepository {

    private final JdbcTemplate jdbcTemplate;


    public boolean exists(
        String currencyCode
    ) {
        Boolean exists =
            jdbcTemplate.queryForObject(
                """
                    SELECT EXISTS (
                        SELECT 1
                        FROM finance.currencies
                        WHERE code = ?
                    )
                    """,
                Boolean.class,
                currencyCode
            );

        return Boolean.TRUE.equals(exists);
    }
}
