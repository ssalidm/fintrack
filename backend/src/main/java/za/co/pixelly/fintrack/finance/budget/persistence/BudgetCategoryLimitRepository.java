package za.co.pixelly.fintrack.finance.budget.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import za.co.pixelly.fintrack.finance.budget.domain.BudgetCategoryLimit;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetCategoryLimitRepository
    extends JpaRepository<BudgetCategoryLimit, UUID> {

    List<BudgetCategoryLimit> findAllByBudgetIdAndUserIdOrderByCreatedAtAsc(
        UUID budgetId,
        UUID userId
    );

    Optional<BudgetCategoryLimit> findByIdAndBudgetIdAndUserId(
        UUID id,
        UUID budgetId,
        UUID userId
    );

    boolean existsByBudgetIdAndCategoryId(
        UUID budgetId,
        UUID categoryId
    );

    boolean existsByBudgetIdAndCategoryIdAndIdNot(
        UUID budgetId,
        UUID categoryId,
        UUID id
    );
}
