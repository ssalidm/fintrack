package za.co.pixelly.fintrack.identity.persistence;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.identity.domain.RegistrationRequest;

import java.util.Optional;
import java.util.UUID;

public interface RegistrationRequestRepository
    extends JpaRepository<RegistrationRequest, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select request
        from RegistrationRequest request
        where request.tokenHash = :tokenHash
        """)
    Optional<RegistrationRequest>
    findByTokenHashForUpdate(
        @Param("tokenHash")
        String tokenHash
    );


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select request
        from RegistrationRequest request
        where request.email = :email
          and request.consumedAt is null
          and request.invalidatedAt is null
        """)
    Optional<RegistrationRequest>
    findActiveByEmailForUpdate(
        @Param("email")
        String email
    );
}
