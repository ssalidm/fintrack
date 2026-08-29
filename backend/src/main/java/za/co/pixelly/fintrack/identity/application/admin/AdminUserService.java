package za.co.pixelly.fintrack.identity.application.admin;

import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.identity.api.admin.AdminUserResponse;
import za.co.pixelly.fintrack.identity.api.admin.AdminUserSessionResponse;

import java.util.UUID;

public interface AdminUserService {

    PageResponse<AdminUserResponse> findUsers(
        int page,
        int size
    );

    AdminUserResponse findUserById(UUID userId);

    AdminUserResponse deactivateUser(
        UUID adminUserId,
        UUID targetUserId,
        long version
    );

    AdminUserResponse activateUser(
        UUID adminUserId,
        UUID targetUserId,
        long version
    );

    PageResponse<AdminUserSessionResponse> findUserSessions(
        UUID adminUserId,
        UUID targetUserId,
        int page,
        int size
    );

    void revokeUserSessions(
        UUID adminUserId,
        UUID targetUserId
    );
}
