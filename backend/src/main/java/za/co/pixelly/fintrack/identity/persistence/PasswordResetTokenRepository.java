package za.co.pixelly.fintrack.identity.persistence;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.identity.domain.PasswordResetToken;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository
    extends JpaRepository<PasswordResetToken, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select token
        from PasswordResetToken token
        where token.tokenHash = :tokenHash
        """)
    Optional<PasswordResetToken> findByTokenHashForUpdate(
        @Param("tokenHash") String tokenHash
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select token
        from PasswordResetToken token
        where token.userId = :userId
          and token.consumedAt is null
          and token.invalidatedAt is null
        """)
    Optional<PasswordResetToken> findActiveByUserIdForUpdate(
        @Param("userId") UUID userId
    );
}
