package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.identity.api.ChangePasswordRequest;
import za.co.pixelly.fintrack.identity.api.UpdateUserProfileRequest;
import za.co.pixelly.fintrack.identity.api.UserProfileResponse;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidCurrentPasswordException;
import za.co.pixelly.fintrack.identity.application.exceptions.PasswordReuseException;
import za.co.pixelly.fintrack.identity.application.exceptions.UserProfileConflictException;
import za.co.pixelly.fintrack.identity.application.exceptions.UserProfileNotFoundException;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.persistence.AuthSessionRepository;
import za.co.pixelly.fintrack.identity.persistence.RefreshTokenRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRoleRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DefaultUserProfileService implements UserProfileService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthSessionRepository authSessionRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    private static final String PASSWORD_CHANGE_REASON = "PASSWORD_CHANGED";


    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userid) {
        User user = userRepository
            .findById(userid)
            .orElseThrow(UserProfileNotFoundException::new);

        List<String> roles = userRoleRepository
            .findRoleCodesByUserId(userid);

        return UserProfileResponse.from(user, roles);
    }


    @Override
    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateUserProfileRequest request) {
        User user = getUserForUpdate(userId);

        if (user.getVersion() != request.version()) {
            throw new UserProfileConflictException(
                "The profile has changed since it was last retrieved"
            );
        }

        user.updateProfile(
            request.firstName(),
            request.lastName(),
            request.timeZone()
        );

        User saved = userRepository.saveAndFlush(user);

        List<String> roles = userRoleRepository
            .findRoleCodesByUserId(userId);

        return UserProfileResponse.from(
            saved,
            roles
        );
    }


    @Override
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        Instant now = Instant.now();

        User user = getUserForUpdate(userId);

        /*
         * Re-authenticate the user before allowing
         * security-sensitive credential change.
         */
        if (!passwordEncoder.matches(
            request.currentPassword(),
            user.getPasswordHash()
        )) {
            throw new InvalidCurrentPasswordException();
        }

        /*
         * BCrypt hashes are salted, so comparing encoded
         * strings would not work. We must use matched()
         * against the existing hash.
         */
        if (passwordEncoder.matches(
            request.newPassword(),
            user.getPasswordHash()
        )) {
            throw new PasswordReuseException();
        }

        String newPasswordHash = passwordEncoder
            .encode(request.newPassword());

        /*
         * Reuse the same domain mutation already used by
         * the password-reset flow.
         *
         * It also clears failed-login state.
         */
        user.resetPassword(
            newPasswordHash,
            now
        );

        /*
         * Password changes are a security boundary.
         *
         * Revoke every outstanding refresh token and
         * every active authentication session.
         */
        refreshTokenRepository
            .revokeActiveByUserId(
                userId,
                now,
                PASSWORD_CHANGE_REASON
            );

        authSessionRepository
            .revokeActiveByUserId(
                userId,
                now,
                PASSWORD_CHANGE_REASON
            );
    }


    private User getUserForUpdate(UUID userId) {
        return userRepository
            .findByIdForUpdate(userId)
            .orElseThrow(UserProfileNotFoundException::new);
    }
}
