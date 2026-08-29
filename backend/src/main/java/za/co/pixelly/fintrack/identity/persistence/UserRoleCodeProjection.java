package za.co.pixelly.fintrack.identity.persistence;

import java.util.UUID;

public interface UserRoleCodeProjection {

    UUID getUserId();

    String getRoleCode();
}
