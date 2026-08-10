package za.co.pixelly.fintrack.identity.persistence;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.identity.domain.EmailVerificationToken;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationTokenRepository
    extends JpaRepository<EmailVerificationToken, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select token
        from EmailVerificationToken token
        where token.tokenHash = :tokenHash
        """)
    Optional<EmailVerificationToken>
    findByTokenHashForUpdate(
        @Param("tokenHash") String tokenHash
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select token
            from EmailVerificationToken token
            where token.userId = :userId
              and token.consumedAt is null
              and token.invalidatedAt is null
            """)
    Optional<EmailVerificationToken>
    findActiveByUserIdForUpdate(
        @Param("userId") UUID userId
    );
}
