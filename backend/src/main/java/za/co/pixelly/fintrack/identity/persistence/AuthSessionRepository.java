package za.co.pixelly.fintrack.identity.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import za.co.pixelly.fintrack.identity.domain.AuthSession;

import java.util.Optional;
import java.util.UUID;

public interface AuthSessionRepository extends JpaRepository<AuthSession, UUID> {

    Optional<AuthSession> findByIdAndUserId(UUID id, UUID userId);
}
