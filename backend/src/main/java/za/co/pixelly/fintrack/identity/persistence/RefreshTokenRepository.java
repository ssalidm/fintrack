package za.co.pixelly.fintrack.identity.persistence;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.identity.domain.RefreshToken;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT rt
        FROM RefreshToken rt
        WHERE rt.tokenHash = :tokenHash
        """)
    Optional<RefreshToken> findByTokenHashForUpdate(
        @Param("tokenHash") String tokenHash
    );

    @Modifying
    @Query("""
        UPDATE RefreshToken rt
        SET rt.revokedAt = :now,
            rt.revocationReason = :reason
        WHERE rt.sessionId = :sessionId
            AND rt.revokedAt is null
            AND rt.consumedAt is null
        """)
    int revokeActiveBySessionId(
        @Param("sessionId") UUID sessionId,
        @Param("now") Instant now,
        @Param("reason") String reason
    );
}
