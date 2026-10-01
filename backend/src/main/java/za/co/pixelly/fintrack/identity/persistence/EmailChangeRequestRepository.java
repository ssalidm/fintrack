package za.co.pixelly.fintrack.identity.persistence;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.identity.domain.EmailChangeRequest;

import java.util.Optional;
import java.util.UUID;

public interface EmailChangeRequestRepository
    extends JpaRepository<EmailChangeRequest, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select request
        from EmailChangeRequest request
        where request.tokenHash = :tokenHash
        """)
    Optional<EmailChangeRequest> findByTokenHashForUpdate(
        @Param("tokenHash") String tokenHash
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select request
        from EmailChangeRequest request
        where request.userId = :userId
          and request.confirmedAt is null
          and request.invalidatedAt is null
        """)
    Optional<EmailChangeRequest> findActiveByUserIdForUpdate(
        @Param("userId") UUID userId
    );
}
