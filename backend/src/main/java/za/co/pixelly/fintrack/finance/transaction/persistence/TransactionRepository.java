package za.co.pixelly.fintrack.finance.transaction.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import za.co.pixelly.fintrack.finance.transaction.domain.Transaction;

import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository
    extends JpaRepository<Transaction, UUID>,
    JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndUserId(
        UUID id,
        UUID userId
    );
}
