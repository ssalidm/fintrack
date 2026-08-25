package za.co.pixelly.fintrack.finance.budget.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import za.co.pixelly.fintrack.finance.budget.domain.Budget;
import za.co.pixelly.fintrack.finance.budget.domain.BudgetStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetRepository
    extends JpaRepository<Budget, UUID> {

    Optional<Budget> findByIdAndUserId(
        UUID id,
        UUID userId
    );

    List<Budget>
    findAllByUserIdAndStatusOrderByBudgetMonthDescCreatedAtDesc(
        UUID userId,
        BudgetStatus status
    );

    boolean existsByUserIdAndBudgetMonthAndCurrencyCodeAndStatus(
        UUID userId,
        LocalDate budgetMonth,
        String currencyCode,
        BudgetStatus status
    );
}
