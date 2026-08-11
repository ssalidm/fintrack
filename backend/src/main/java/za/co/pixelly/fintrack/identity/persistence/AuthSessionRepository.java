package za.co.pixelly.fintrack.identity.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.identity.domain.AuthSession;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface AuthSessionRepository extends JpaRepository<AuthSession, UUID> {

    Optional<AuthSession> findByIdAndUserId(UUID id, UUID userId);

    @Modifying
    @Query("""
        update AuthSession session
           set session.revokedAt = :now,
               session.revocationReason = :reason,
               session.version = session.version + 1
         where session.userId = :userId
           and session.revokedAt is null
        """)
    int revokeActiveByUserId(
        @Param("userId") UUID userId,
        @Param("now") Instant now,
        @Param("reason") String reason
    );
}
