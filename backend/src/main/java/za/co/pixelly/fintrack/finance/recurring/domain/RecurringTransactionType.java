package za.co.pixelly.fintrack.finance.recurring.domain;

import za.co.pixelly.fintrack.finance.transaction.domain.TransactionType;

public enum RecurringTransactionType {

    INCOME,
    EXPENSE;

    public TransactionType toTransactionType() {
        return TransactionType.valueOf(name());
    }
}
