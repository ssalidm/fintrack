package za.co.pixelly.fintrack.finance.transfer.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class TransferCommandRepository {

    private final JdbcTemplate jdbcTemplate;

    public UUID createTransfer(
        UUID userId,
        UUID sourceAccountId,
        UUID destinationAccountId,
        BigDecimal amount,
        LocalDate transactionDate,
        String description
    ) {
        return jdbcTemplate.queryForObject(
            """
                SELECT finance.create_transfer(
                ?,?,?,?,?,?
                )
                """,
            UUID.class,
            userId,
            sourceAccountId,
            destinationAccountId,
            amount,
            transactionDate,
            description
        );
    }


    public UUID voidTransfer(
        UUID userId,
        UUID transferId,
        String reason
    ) {
        return jdbcTemplate.queryForObject(
            """
                SELECT finance.void_transfer(
                ?,?,?
                )
                """,
            UUID.class,
            userId,
            transferId,
            reason
        );
    }
}
