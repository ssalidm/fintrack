package za.co.pixelly.fintrack.finance.recurring.api;

import za.co.pixelly.fintrack.finance.recurring.domain.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RecurringTransactionResponse(

    UUID id,
    UUID accountId,
    UUID categoryId,
    String name,
    RecurringTransactionType transactionType,
    BigDecimal amount,
    String description,
    String merchantName,
    RecurringFrequency frequency,
    short intervalCount,
    LocalDate startDate,
    LocalDate nextDueDate,
    LocalDate endDate,
    LocalDate lastGeneratedDate,
    boolean autoPost,
    RecurringTransactionStatus status,
    Instant completedAt,
    Instant archivedAt,
    Instant createdAt,
    Instant updatedAt,
    long version

) {

    public static RecurringTransactionResponse from(
        RecurringTransaction schedule
    ) {
        return new RecurringTransactionResponse(
            schedule.getId(),
            schedule.getAccountId(),
            schedule.getCategoryId(),
            schedule.getName(),
            schedule.getTransactionType(),
            schedule.getAmount(),
            schedule.getDescription(),
            schedule.getMerchantName(),
            schedule.getFrequency(),
            schedule.getIntervalCount(),
            schedule.getStartDate(),
            schedule.getNextDueDate(),
            schedule.getEndDate(),
            schedule.getLastGeneratedDate(),
            schedule.isAutoPost(),
            schedule.getStatus(),
            schedule.getCompletedAt(),
            schedule.getArchivedAt(),
            schedule.getCreatedAt(),
            schedule.getUpdatedAt(),
            schedule.getVersion()
        );
    }
}
