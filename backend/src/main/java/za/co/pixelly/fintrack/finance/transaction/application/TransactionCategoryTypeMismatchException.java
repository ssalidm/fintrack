package za.co.pixelly.fintrack.finance.transaction.application;

public class TransactionCategoryTypeMismatchException
    extends RuntimeException {

    public TransactionCategoryTypeMismatchException() {
        super(
            "Transaction type must match the category type"
        );
    }
}
