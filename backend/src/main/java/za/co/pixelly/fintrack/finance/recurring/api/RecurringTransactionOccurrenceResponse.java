package za.co.pixelly.fintrack.finance.recurring.api;

import za.co.pixelly.fintrack.finance.transaction.api.TransactionResponse;

public record RecurringTransactionOccurrenceResponse(

    RecurringTransactionResponse schedule,
    TransactionResponse transaction

) {
}
