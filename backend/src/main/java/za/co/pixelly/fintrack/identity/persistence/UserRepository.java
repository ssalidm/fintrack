package za.co.pixelly.fintrack.identity.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import za.co.pixelly.fintrack.identity.domain.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);
}
