package za.co.pixelly.fintrack.finance.budget.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;

@Entity
@Table(name = "budgets", schema = "finance")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "budget_month", nullable = false)
    private LocalDate budgetMonth;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private BudgetStatus status;

    @Column(name = "archived_at")
    private Instant archivedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;


    public static Budget create(
        UUID userId,
        String name,
        LocalDate budgetMonth,
        String currencyCode,
        Instant now
    ) {
        Budget budget = new Budget();

        budget.userId = userId;
        budget.name = name.trim();

        budget.budgetMonth = budgetMonth.withDayOfMonth(1);

        budget.currencyCode = currencyCode
                .trim()
                .toUpperCase(Locale.ROOT);

        budget.status = BudgetStatus.ACTIVE;

        budget.archivedAt = null;
        budget.createdAt = now;
        budget.updatedAt = now;

        return budget;
    }


    public void rename(String name, Instant now) {
        this.name = name.trim();
        this.updatedAt = now;
    }


    public void archive(Instant now) {
        this.status = BudgetStatus.ARCHIVED;

        this.archivedAt = now;
        this.updatedAt = now;
    }
}
