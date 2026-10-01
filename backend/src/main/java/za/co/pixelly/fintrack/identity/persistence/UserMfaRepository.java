package za.co.pixelly.fintrack.identity.persistence;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.identity.domain.MfaStatus;
import za.co.pixelly.fintrack.identity.domain.UserMfa;

import java.util.Optional;
import java.util.UUID;

public interface UserMfaRepository
    extends JpaRepository<UserMfa, UUID> {

    boolean existsByUserIdAndStatus(
        UUID userId,
        MfaStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select mfa
        from UserMfa mfa
        where mfa.userId = :userId
        """)
    Optional<UserMfa> findByUserIdForUpdate(
        @Param("userId") UUID userId
    );
}
