package za.co.pixelly.fintrack.finance.account.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "accounts", schema = "finance")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 32)
    private AccountType accountType;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode;

    @Column(name = "opening_balance", nullable = false, precision = 19, scale = 4)
    private BigDecimal openingBalance;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private AccountStatus status;

    @Column(name = "include_in_net_worth", nullable = false)
    private boolean includeInNetWorth;

    @Column(name = "archived_at")
    private Instant archivedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    public static Account create(
        UUID userId,
        String name,
        AccountType accountType,
        String currencyCode,
        BigDecimal openingBalance,
        boolean includeInNetWorth,
        Instant now
    ) {
        Account account = new Account();

        account.userId = userId;
        account.name = name;
        account.accountType = accountType;
        account.currencyCode = currencyCode;
        account.openingBalance = openingBalance;
        account.status = AccountStatus.ACTIVE;
        account.includeInNetWorth = includeInNetWorth;
        account.createdAt = now;
        account.updatedAt = now;

        return account;
    }

    public void update(
        String name,
        AccountType accountType,
        BigDecimal openingBalance,
        Boolean includeInNetWorth,
        Instant now
    ) {
        if (name != null) this.name = name;
        if (accountType != null) this.accountType = accountType;
        if (openingBalance != null) this.openingBalance = openingBalance;
        if (includeInNetWorth != null) this.includeInNetWorth = includeInNetWorth;

        this.updatedAt = now;
    }

    public void archive(Instant now) {
        this.status = AccountStatus.ARCHIVED;
        this.archivedAt = now;
        this.updatedAt = now;
    }
}
