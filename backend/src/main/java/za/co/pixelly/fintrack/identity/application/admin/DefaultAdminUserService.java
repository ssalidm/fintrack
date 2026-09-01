package za.co.pixelly.fintrack.identity.application.admin;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.identity.api.admin.AdminUserResponse;
import za.co.pixelly.fintrack.identity.api.admin.AdminUserSessionResponse;
import za.co.pixelly.fintrack.identity.application.exceptions.AdminOperationNotAllowedException;
import za.co.pixelly.fintrack.identity.application.exceptions.AdminUserConflictException;
import za.co.pixelly.fintrack.identity.application.exceptions.AdminUserNotFoundException;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.domain.UserStatus;
import za.co.pixelly.fintrack.identity.persistence.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DefaultAdminUserService implements AdminUserService {

    private static final int DEFAULT_SIZE = 25;
    private static final int MAX_SIZE = 100;
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ADMIN_DEACTIVATED_REASON = "ADMIN_DEACTIVATED_USER";
    private static final String ADMIN_SESSION_REVOCATION_REASON = "ADMIN_REVOKED_SESSIONS";

    private final AuthSessionRepository authSessionRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;


    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> findUsers(int page, int size) {
        Page<User> users = userRepository
            .findAllByOrderByCreatedAtDesc(
                PageRequest.of(
                    page,
                    size
                )
            );

        if (users.isEmpty()) {
            return PageResponse.from(
                users.map(user ->
                    AdminUserResponse.from(
                        user,
                        List.of()
                    )
                )
            );
        }

        List<UUID> userIds = users.getContent()
            .stream()
            .map(User::getId)
            .toList();

        Map<UUID, List<String>> rolesByUser = userRoleRepository
            .findRoleCodesByUserIds(userIds)
            .stream()
            .collect(
                Collectors.groupingBy(
                    UserRoleCodeProjection::getUserId,
                    Collectors.mapping(
                        UserRoleCodeProjection::getRoleCode,
                        Collectors.toList()
                    )
                )
            );

        Page<AdminUserResponse> responsePage = users.map(user ->
            AdminUserResponse.from(
                user,
                rolesByUser.getOrDefault(
                    user.getId(),
                    List.of()
                )
            )
        );

        return PageResponse.from(
            responsePage
        );
    }


    @Override
    @Transactional(readOnly = true)
    public AdminUserResponse findUserById(UUID userId) {
        User user = userRepository
            .findById(userId)
            .orElseThrow(
                AdminUserNotFoundException::new
            );

        List<String> roles = userRoleRepository
            .findRoleCodesByUserId(userId);

        return AdminUserResponse.from(user, roles);
    }


    @Override
    @Transactional
    public AdminUserResponse deactivateUser(UUID adminUserId, UUID targetUserId, long requestedVersion) {
        /*
         * Admin operations are never used to manage
         * the administrator's own account.
         */
        if (adminUserId.equals(targetUserId)) {
            throw new AdminOperationNotAllowedException(
                "Administrators cannot deactivate their own account"
            );
        }

        User targetUser = userRepository.findByIdForUpdate(targetUserId)
            .orElseThrow(AdminUserNotFoundException::new);

        /*
         * Administrators are peers for v1.
         * One administrator cannot control another.
         */
        if (userRoleRepository.hasRole(targetUserId, ROLE_ADMIN)) {
            throw new AdminOperationNotAllowedException(
                "Administrators cannot deactivate another administrator"
            );
        }

        if (targetUser.getStatus() == UserStatus.DEACTIVATED) {
            throw new AdminUserConflictException(
                "User is already deactivated"
            );
        }

        if (targetUser.getVersion() != requestedVersion) {
            throw new AdminUserConflictException(
                "The user has changed since it was last retrieved"
            );
        }

        Instant now = Instant.now();

        targetUser.deactivate(now);

        /*
         * Deactivation must terminate authentication
         * immediately.
         */
        refreshTokenRepository
            .revokeActiveByUserId(
                targetUserId,
                now,
                ADMIN_DEACTIVATED_REASON
            );

        authSessionRepository
            .revokeActiveByUserId(
                targetUserId,
                now,
                ADMIN_DEACTIVATED_REASON
            );

        User saved = userRepository
            .saveAndFlush(targetUser);

        List<String> roles = userRoleRepository
            .findRoleCodesByUserId(targetUserId);

        return AdminUserResponse.from(saved, roles);

    }


    @Override
    @Transactional
    public AdminUserResponse activateUser(UUID adminUserId, UUID targetUserId, long requestedVersion) {

        if (adminUserId.equals(targetUserId)) {
            throw new AdminOperationNotAllowedException(
                "Administrators cannot activate their own account through the admin API"
            );
        }


        User targetUser = userRepository
            .findByIdForUpdate(targetUserId)
            .orElseThrow(AdminUserNotFoundException::new);


        /*
         * Administrators are peers and cannot manage
         * one another.
         */
        if (userRoleRepository.hasRole(
            targetUserId,
            ROLE_ADMIN
        )) {
            throw new AdminOperationNotAllowedException(
                "Administrators cannot activate another administrator"
            );
        }


        if (targetUser.getStatus() != UserStatus.DEACTIVATED) {
            throw new AdminUserConflictException(
                "Only deactivated users can be activated"
            );
        }


        if (targetUser.getVersion() != requestedVersion) {
            throw new AdminUserConflictException(
                "The user has changed since it was last retrieved"
            );
        }


        targetUser.activate(Instant.now());

        User saved = userRepository.saveAndFlush(targetUser);

        List<String> roles = userRoleRepository
            .findRoleCodesByUserId(
                targetUserId
            );

        return AdminUserResponse.from(saved, roles);
    }


    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminUserSessionResponse> findUserSessions(
        UUID adminUserId,
        UUID targetUserId,
        int page,
        int size
    ) {
        if (adminUserId.equals(targetUserId)) {
            throw new AdminOperationNotAllowedException(
                "Administrators cannot inspect their own sessions through the admin API"
            );
        }

        /*
         * Make sure the target actually exists before
         * evaluating its roles or querying sessions.
         */
        userRepository
            .findById(targetUserId)
            .orElseThrow(AdminUserNotFoundException::new);

        if (userRoleRepository.hasRole(
            targetUserId,
            ROLE_ADMIN
        )) {
            throw new AdminOperationNotAllowedException(
                "Administrators cannot inspect another administrator's sessions"
            );
        }

        Instant now = Instant.now();

        Page<AdminUserSessionResponse> sessions = authSessionRepository
            .findAllByUserIdOrderByCreatedAtDesc(
                targetUserId,
                PageRequest.of(
                    page,
                    size
                )
            )
            .map(
                session -> AdminUserSessionResponse.from(
                    session,
                    now
                )
            );

        return PageResponse.from(sessions);
    }


    @Override
    @Transactional
    public void revokeUserSessions(UUID adminUserId, UUID targetUserId) {
        if (adminUserId.equals(targetUserId)) {
            throw new AdminOperationNotAllowedException(
                "Administrators cannot revoke their own sessions through the admin API"
            );
        }

        /*
         * Ensure the target exists before doing anything
         * security-sensitive.
         */
        userRepository
            .findById(targetUserId)
            .orElseThrow(AdminUserNotFoundException::new);

        /*
         * Administrators are peers for v1.
         * One administrator cannot revoke another
         * administrator's sessions.
         */
        if (userRoleRepository.hasRole(targetUserId, ROLE_ADMIN)) {
            throw new AdminOperationNotAllowedException(
                "Administrators cannot revoke another administrator's sessions"
            );
        }

        Instant now = Instant.now();

        /*
         * Revoke refresh tokens first so no new access
         * token can be minted from an existing session.
         */
        refreshTokenRepository
            .revokeActiveByUserId(
                targetUserId,
                now,
                ADMIN_SESSION_REVOCATION_REASON
            );


        /*
         * Revoking auth sessions also invalidates all
         * existing JWT access tokens because sid is now
         * checked during JWT validation.
         */
        authSessionRepository
            .revokeActiveByUserId(
                targetUserId,
                now,
                ADMIN_SESSION_REVOCATION_REASON
            );
    }
}
