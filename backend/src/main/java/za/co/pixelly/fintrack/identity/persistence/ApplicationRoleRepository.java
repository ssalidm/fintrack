package za.co.pixelly.fintrack.identity.persistence;


import org.springframework.data.jpa.repository.JpaRepository;
import za.co.pixelly.fintrack.identity.domain.ApplicationRole;

import java.util.Optional;
import java.util.UUID;

public interface ApplicationRoleRepository extends JpaRepository<ApplicationRole, UUID> {

    Optional<ApplicationRole> findByCode(String code);
}
