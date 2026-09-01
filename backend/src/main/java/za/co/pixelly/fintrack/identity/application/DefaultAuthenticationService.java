package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.common.Util;
import za.co.pixelly.fintrack.finance.account.application.exceptions.AccountNotActiveException;
import za.co.pixelly.fintrack.config.security.JwtProperties;
import za.co.pixelly.fintrack.identity.api.LoginRequest;
import za.co.pixelly.fintrack.identity.api.RefreshRequest;
import za.co.pixelly.fintrack.identity.api.TokenResponse;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidCredentialsException;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidRefreshTokenException;
import za.co.pixelly.fintrack.identity.domain.AuthSession;
import za.co.pixelly.fintrack.identity.domain.RefreshToken;
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
public class DefaultAuthenticationService implements AuthenticationService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final AuthSessionRepository sessionRepository;
    private final LoginAttemptService loginAttemptService;
    private final RefreshTokenRepository refreshTokenRepository;

    private final PasswordEncoder passwordEncoder;
    private final OpaqueTokenCodec refreshTokenCodec;
    private final AccessTokenService accessTokenService;
    private final JwtProperties jwtProperties;


    @Override
    @Transactional
    public TokenResponse login(
        LoginRequest request,
        String userAgent
    ) {
        Instant now = Instant.now();
        String email = Util.normalizeEmail(request.email());

        User user = userRepository
            .findByEmail(email)
            .orElseThrow(InvalidCredentialsException::new);

        /*
         * Do not allow further attempts during a temporary lock.
         */
        if (user.isTemporarilyLocked(now)) {
            throw new InvalidCredentialsException();
        }

        if (!passwordEncoder.matches(
            request.password(),
            user.getPasswordHash()
        )) {

            loginAttemptService.recordFailure(user.getId());

            throw new InvalidCredentialsException();
        }

        /*
         * Only reveal account-state information after
         * the password itself has been proven correct.
         */
        if (!user.isActive()) {

            if (user.isPendingVerification()) {
                throw new AccountNotActiveException();
            }

            throw new InvalidCredentialsException();
        }

        Instant sessionExpiresAt =
            now.plus(jwtProperties.RefreshTokenTtl());

        AuthSession session = AuthSession.open(
            user.getId(),
            now,
            sessionExpiresAt,
            userAgent
        );

        sessionRepository.saveAndFlush(session);

        List<String> roles =
            userRoleRepository.findRoleCodesByUserId(
                user.getId()
            );

        String rawRefreshToken =
            refreshTokenCodec.generate();

        RefreshToken refreshToken = RefreshToken.issue(
            session.getId(),
            user.getId(),
            refreshTokenCodec.hash(rawRefreshToken),
            now,
            sessionExpiresAt
        );

        refreshTokenRepository.save(refreshToken);

        AccessTokenService.IssuedAccessToken accessToken =
            accessTokenService.issue(
                user.getId(),
                session.getId(),
                roles,
                now
            );

        user.recordSuccessfulLogin(now);

        return response(
            accessToken,
            rawRefreshToken,
            now
        );
    }

    @Override
    @Transactional
    public TokenResponse refresh(RefreshRequest request) {

        Instant now = Instant.now();

        String hash =
            refreshTokenCodec.hash(request.refreshToken());

        RefreshToken oldToken = refreshTokenRepository
            .findByTokenHashForUpdate(hash)
            .orElseThrow(InvalidRefreshTokenException::new);

        if (!oldToken.isUsable(now)) {
            throw new InvalidRefreshTokenException();
        }

        AuthSession session = sessionRepository
            .findByIdAndUserId(
                oldToken.getSessionId(),
                oldToken.getUserId()
            )
            .orElseThrow(InvalidRefreshTokenException::new);

        if (!session.isActive(now)) {
            throw new InvalidRefreshTokenException();
        }

        User user = userRepository
            .findById(oldToken.getUserId())
            .orElseThrow(InvalidRefreshTokenException::new);

        if (!user.canAuthenticate(now)) {
            throw new InvalidRefreshTokenException();
        }

        List<String> roles =
            userRoleRepository.findRoleCodesByUserId(user.getId());

        String rawNewToken = refreshTokenCodec.generate();

        RefreshToken newToken = RefreshToken.issue(
            session.getId(),
            user.getId(),
            refreshTokenCodec.hash(rawNewToken),
            now,
            session.getExpiresAt()
        );

        refreshTokenRepository.saveAndFlush(newToken);

        oldToken.rotateTo(
            now,
            newToken.getId()
        );

        session.touch(now);

        AccessTokenService.IssuedAccessToken accessToken =
            accessTokenService.issue(
                user.getId(),
                session.getId(),
                roles,
                now
            );

        return response(
            accessToken,
            rawNewToken,
            now
        );
    }

    @Override
    @Transactional
    public void logout(
        UUID userId,
        UUID sessionId
    ) {
        AuthSession session = sessionRepository
            .findByIdAndUserId(sessionId, userId)
            .orElseThrow(InvalidRefreshTokenException::new);

        Instant now = Instant.now();

        session.revoke(now, "USER_LOGOUT");

        refreshTokenRepository.revokeActiveBySessionId(
            sessionId,
            now,
            "USER_LOGOUT"
        );
    }

    private TokenResponse response(
        AccessTokenService.IssuedAccessToken accessToken,
        String refreshToken,
        Instant now
    ) {
        return new TokenResponse(
            accessToken.value(),
            refreshToken,
            "Bearer",
            accessToken.expiresAt()
                .getEpochSecond()
                - now.getEpochSecond()
        );
    }
}
