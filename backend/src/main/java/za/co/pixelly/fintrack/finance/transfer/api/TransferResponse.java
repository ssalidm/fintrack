package za.co.pixelly.fintrack.finance.transfer.api;

import za.co.pixelly.fintrack.finance.transfer.domain.Transfer;
import za.co.pixelly.fintrack.finance.transfer.domain.TransferStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TransferResponse(
    UUID id,
    UUID sourceAccountId,
    UUID destinationAccountId,
    BigDecimal amount,
    LocalDate transactionDate,
    String description,
    TransferStatus status,
    Instant voidedAt,
    String voidReason,
    Instant createdAt,
    Instant updatedAt,
    long version
) {

    public static TransferResponse from(
        Transfer transfer
    ) {
        return new TransferResponse(
            transfer.getId(),
            transfer.getSourceAccountId(),
            transfer.getDestinationAccountId(),
            transfer.getAmount(),
            transfer.getTransactionDate(),
            transfer.getDescription(),
            transfer.getStatus(),
            transfer.getVoidedAt(),
            transfer.getVoidReason(),
            transfer.getCreatedAt(),
            transfer.getUpdatedAt(),
            transfer.getVersion()
        );
    }
}
