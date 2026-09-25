package za.co.pixelly.fintrack.finance.transfer.persistence;

import org.springframework.data.jpa.domain.Specification;
import za.co.pixelly.fintrack.finance.transfer.api.TransferQuery;
import za.co.pixelly.fintrack.finance.transfer.domain.Transfer;

import java.time.LocalDate;
import java.util.UUID;

public final class TransferSpecifications {

    private TransferSpecifications() {
    }

    public static Specification<Transfer> from(
        UUID userId,
        TransferQuery filters
    ) {
        Specification<Transfer> specification =
            ownedBy(userId);

        if (
            filters.getSourceAccountId()
                != null
        ) {
            specification =
                specification.and(
                    sourceAccountIs(
                        filters
                            .getSourceAccountId()
                    )
                );
        }

        if (
            filters.getDestinationAccountId()
                != null
        ) {
            specification =
                specification.and(
                    destinationAccountIs(
                        filters
                            .getDestinationAccountId()
                    )
                );
        }

        if (
            filters.getStatus()
                != null
        ) {
            specification =
                specification.and(
                    (
                        root,
                        query,
                        criteriaBuilder
                    ) ->
                        criteriaBuilder.equal(
                            root.get(
                                "status"
                            ),
                            filters
                                .getStatus()
                        )
                );
        }

        if (
            filters.getFromDate()
                != null
        ) {
            specification =
                specification.and(
                    onOrAfter(
                        filters
                            .getFromDate()
                    )
                );
        }

        if (
            filters.getToDate()
                != null
        ) {
            specification =
                specification.and(
                    onOrBefore(
                        filters
                            .getToDate()
                    )
                );
        }

        return specification;
    }

    private static Specification<Transfer>
    ownedBy(
        UUID userId
    ) {
        return (
            root,
            query,
            criteriaBuilder
        ) ->
            criteriaBuilder.equal(
                root.get(
                    "userId"
                ),
                userId
            );
    }

    private static Specification<Transfer>
    sourceAccountIs(
        UUID accountId
    ) {
        return (
            root,
            query,
            criteriaBuilder
        ) ->
            criteriaBuilder.equal(
                root.get(
                    "sourceAccountId"
                ),
                accountId
            );
    }

    private static Specification<Transfer>
    destinationAccountIs(
        UUID accountId
    ) {
        return (
            root,
            query,
            criteriaBuilder
        ) ->
            criteriaBuilder.equal(
                root.get(
                    "destinationAccountId"
                ),
                accountId
            );
    }

    private static Specification<Transfer>
    onOrAfter(
        LocalDate date
    ) {
        return (
            root,
            query,
            criteriaBuilder
        ) ->
            criteriaBuilder
                .greaterThanOrEqualTo(
                    root.get(
                        "transactionDate"
                    ),
                    date
                );
    }

    private static Specification<Transfer>
    onOrBefore(
        LocalDate date
    ) {
        return (
            root,
            query,
            criteriaBuilder
        ) ->
            criteriaBuilder
                .lessThanOrEqualTo(
                    root.get(
                        "transactionDate"
                    ),
                    date
                );
    }
}
