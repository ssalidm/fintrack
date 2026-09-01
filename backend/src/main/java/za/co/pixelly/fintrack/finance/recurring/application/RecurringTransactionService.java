package za.co.pixelly.fintrack.finance.recurring.application;

import za.co.pixelly.fintrack.finance.recurring.api.*;
import za.co.pixelly.fintrack.finance.recurring.domain.RecurringTransactionStatus;

import java.util.List;
import java.util.UUID;

public interface RecurringTransactionService {

    RecurringTransactionResponse create(
        UUID userId,
        CreateRecurringTransactionRequest request
    );

    List<RecurringTransactionResponse> findAll(
        UUID userId,
        RecurringTransactionStatus status
    );

    RecurringTransactionResponse findById(
        UUID userId,
        UUID scheduleId
    );

    RecurringTransactionResponse update(
        UUID userId,
        UUID scheduleId,
        UpdateRecurringTransactionRequest request
    );

    RecurringTransactionResponse pause(
        UUID userId,
        UUID scheduleId,
        RecurringTransactionVersionRequest request
    );

    RecurringTransactionResponse resume(
        UUID userId,
        UUID scheduleId,
        RecurringTransactionVersionRequest request
    );

    RecurringTransactionResponse archive(
        UUID userId,
        UUID scheduleId,
        RecurringTransactionVersionRequest request
    );

    RecurringTransactionOccurrenceResponse postDue(
        UUID userId,
        UUID scheduleId,
        RecurringTransactionVersionRequest request
    );
}
