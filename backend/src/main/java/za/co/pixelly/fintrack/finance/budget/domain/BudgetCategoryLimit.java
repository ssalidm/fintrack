package za.co.pixelly.fintrack.finance.budget.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "budget_category_limits", schema = "finance")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BudgetCategoryLimit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "budget_id", nullable = false)
    private UUID budgetId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(
        name = "limit_amount",
        nullable = false,
        precision = 19,
        scale = 4
    )
    private BigDecimal limitAmount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;


    public static BudgetCategoryLimit create(
        UUID budgetId,
        UUID userId,
        UUID categoryId,
        BigDecimal limitAmount,
        Instant now
    ) {
        BudgetCategoryLimit limit = new BudgetCategoryLimit();

        limit.budgetId = budgetId;
        limit.userId = userId;
        limit.categoryId = categoryId;
        limit.limitAmount = limitAmount;
        limit.createdAt = now;
        limit.updatedAt = now;

        return limit;
    }


    public void update(
        UUID categoryId,
        BigDecimal limitAmount,
        Instant now
    ) {
        if (categoryId != null) {
            this.categoryId = categoryId;
        }

        if (limitAmount != null) {
            this.limitAmount = limitAmount;
        }

        this.updatedAt = now;
    }
}
