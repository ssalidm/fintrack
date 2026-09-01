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

    @Query("""
        SELECT
            ur.user.id AS userId,
            ur.role.code AS roleCode
        FROM UserRole ur
        WHERE ur.user.id IN :userIds
        """)
    List<UserRoleCodeProjection>
    findRoleCodesByUserIds(List<UUID> userIds);

    @Query("""
        SELECT COUNT(ur) > 0
        FROM UserRole ur
        WHERE ur.user.id = :userId
          AND ur.role.code = :roleCode
        """)
    boolean hasRole(
        UUID userId,
        String roleCode
    );

}
