package za.co.pixelly.fintrack.finance.account.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.finance.account.domain.Account;
import za.co.pixelly.fintrack.finance.account.domain.AccountStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByIdAndUserId(UUID id, UUID userID);

    List<Account> findAllByUserIdAndStatusOrderByCreatedAtDesc(
        UUID userId,
        AccountStatus status
    );

    @Query("""
            SELECT count(account) > 0
            FROM Account account
            WHERE account.userId = :userId
                AND account.status = :status
                AND lower(trim(account.name))
                    = lower(trim(:name))
        """)
    boolean existsByNormalizedName(
        @Param("userId") UUID userId,
        @Param("name") String name,
        @Param("status") AccountStatus status
    );

    @Query("""
            SELECT count(account) > 0
            FROM Account account
            WHERE account.userId = :userId
                AND account.status = :status
                AND account.id <> :accountId
                AND lower(trim(account.name))
                    = lower(trim(:name))
        """)
    boolean existsByNormalizedNameExcludingAccount(
        @Param("userId") UUID userId,
        @Param("accountId") UUID accountId,
        @Param("name") String name,
        @Param("status") AccountStatus status
    );
}
