package za.co.pixelly.fintrack.identity.persistence;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.identity.domain.MfaRecoveryCode;

import java.util.Optional;
import java.util.UUID;

public interface MfaRecoveryCodeRepository
    extends JpaRepository<MfaRecoveryCode, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select code
        from MfaRecoveryCode code
        where code.userId = :userId
          and code.codeHash = :codeHash
          and code.usedAt is null
        """)
    Optional<MfaRecoveryCode> findUsableForUpdate(
        @Param("userId") UUID userId,
        @Param("codeHash") String codeHash
    );

    void deleteByUserId(UUID userId);

    long countByUserIdAndUsedAtIsNull(UUID userId);
}
