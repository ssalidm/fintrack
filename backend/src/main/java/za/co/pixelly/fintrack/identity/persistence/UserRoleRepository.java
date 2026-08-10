package za.co.pixelly.fintrack.identity.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import za.co.pixelly.fintrack.identity.domain.UserRole;
import za.co.pixelly.fintrack.identity.domain.UserRoleId;

import java.util.List;
import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    @Query("""
        SELECT ur.role.code
        FROM UserRole ur
        WHERE ur.user.id = :userId
        """)
    List<String> findRoleCodesByUserId(UUID userId);

}
