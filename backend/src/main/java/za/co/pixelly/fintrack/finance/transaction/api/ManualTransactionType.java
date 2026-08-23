package za.co.pixelly.fintrack.finance.transaction.api;

import za.co.pixelly.fintrack.finance.transaction.domain.TransactionType;

public enum ManualTransactionType {

    INCOME,
    EXPENSE;

    public TransactionType toDomain() {
        return TransactionType.valueOf(name());
    }
}
