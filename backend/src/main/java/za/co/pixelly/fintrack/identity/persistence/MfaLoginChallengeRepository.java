package za.co.pixelly.fintrack.identity.persistence;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.identity.domain.MfaLoginChallenge;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MfaLoginChallengeRepository
    extends JpaRepository<MfaLoginChallenge, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select challenge
        from MfaLoginChallenge challenge
        where challenge.tokenHash = :tokenHash
        """)
    Optional<MfaLoginChallenge> findByTokenHashForUpdate(
        @Param("tokenHash") String tokenHash
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select challenge
        from MfaLoginChallenge challenge
        where challenge.userId = :userId
          and challenge.consumedAt is null
          and challenge.invalidatedAt is null
        """)
    List<MfaLoginChallenge> findActiveByUserIdForUpdate(
        @Param("userId") UUID userId
    );

    @Modifying
    @Query("""
        delete from MfaLoginChallenge challenge
        where challenge.expiresAt < :cutoff
        """)
    int deleteExpiredBefore(
        @Param("cutoff") Instant cutoff
    );
}
