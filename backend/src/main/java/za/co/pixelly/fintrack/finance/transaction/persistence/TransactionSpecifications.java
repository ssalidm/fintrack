package za.co.pixelly.fintrack.finance.transaction.persistence;

import org.springframework.data.jpa.domain.Specification;
import za.co.pixelly.fintrack.finance.transaction.api.TransactionQuery;
import za.co.pixelly.fintrack.finance.transaction.domain.Transaction;
import za.co.pixelly.fintrack.finance.transaction.domain.TransactionStatus;
import za.co.pixelly.fintrack.finance.transaction.domain.TransactionType;

import java.util.UUID;

public final class TransactionSpecifications {

    private TransactionSpecifications() {
    }


    public static Specification<Transaction> from(
        UUID userId,
        TransactionQuery filters
    ) {
        Specification<Transaction> specification =
            ownedBy(userId);

        if (filters.getAccountId() != null) {
            specification =
                specification.and(
                    accountIs(
                        filters.getAccountId()
                    )
                );
        }

        if (filters.getCategoryId() != null) {
            specification =
                specification.and(
                    categoryIs(
                        filters.getCategoryId()
                    )
                );
        }

        if (filters.getType() != null) {
            specification =
                specification.and(
                    typeIs(
                        filters.getType()
                    )
                );
        }

        if (filters.getStatus() != null) {
            specification =
                specification.and(
                    statusIs(
                        filters.getStatus()
                    )
                );
        }

        if (filters.getFromDate() != null) {
            specification =
                specification.and(
                    onOrAfter(
                        filters.getFromDate()
                    )
                );
        }

        if (filters.getToDate() != null) {
            specification =
                specification.and(
                    onOrBefore(
                        filters.getToDate()
                    )
                );
        }

        return specification;
    }


    private static Specification<Transaction>
    ownedBy(UUID userId) {

        return (root, query, cb) ->
            cb.equal(
                root.get("userId"),
                userId
            );
    }


    private static Specification<Transaction>
    accountIs(UUID accountId) {

        return (root, query, cb) ->
            cb.equal(
                root.get("accountId"),
                accountId
            );
    }


    private static Specification<Transaction>
    categoryIs(UUID categoryId) {

        return (root, query, cb) ->
            cb.equal(
                root.get("categoryId"),
                categoryId
            );
    }


    private static Specification<Transaction>
    typeIs(
        TransactionType type
    ) {

        return (root, query, cb) ->
            cb.equal(
                root.get("transactionType"),
                type
            );
    }


    private static Specification<Transaction>
    statusIs(
        TransactionStatus status
    ) {

        return (root, query, cb) ->
            cb.equal(
                root.get("status"),
                status
            );
    }


    private static Specification<Transaction>
    onOrAfter(
        java.time.LocalDate date
    ) {

        return (root, query, cb) ->
            cb.greaterThanOrEqualTo(
                root.get("transactionDate"),
                date
            );
    }


    private static Specification<Transaction>
    onOrBefore(
        java.time.LocalDate date
    ) {

        return (root, query, cb) ->
            cb.lessThanOrEqualTo(
                root.get("transactionDate"),
                date
            );
    }
}
