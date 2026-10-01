package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.config.security.JwtProperties;
import za.co.pixelly.fintrack.identity.api.TokenResponse;
import za.co.pixelly.fintrack.identity.domain.AuthSession;
import za.co.pixelly.fintrack.identity.domain.RefreshToken;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.persistence.AuthSessionRepository;
import za.co.pixelly.fintrack.identity.persistence.RefreshTokenRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRoleRepository;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticatedSessionService {

    private final UserRoleRepository userRoleRepository;
    private final AuthSessionRepository sessionRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OpaqueTokenCodec refreshTokenCodec;
    private final AccessTokenService accessTokenService;
    private final JwtProperties jwtProperties;

    @Transactional(propagation = Propagation.MANDATORY)
    public TokenResponse issue(
        User user,
        String userAgent,
        Instant now
    ) {
        Instant sessionExpiresAt =
            now.plus(
                jwtProperties.RefreshTokenTtl()
            );

        AuthSession session =
            AuthSession.open(
                user.getId(),
                now,
                sessionExpiresAt,
                userAgent
            );

        sessionRepository.saveAndFlush(
            session
        );

        List<String> roles =
            userRoleRepository.findRoleCodesByUserId(
                user.getId()
            );

        String rawRefreshToken =
            refreshTokenCodec.generate();

        RefreshToken refreshToken =
            RefreshToken.issue(
                session.getId(),
                user.getId(),
                refreshTokenCodec.hash(
                    rawRefreshToken
                ),
                now,
                sessionExpiresAt
            );

        refreshTokenRepository.save(
            refreshToken
        );

        AccessTokenService.IssuedAccessToken accessToken =
            accessTokenService.issue(
                user.getId(),
                session.getId(),
                roles,
                now
            );

        user.recordSuccessfulLogin(now);

        return new TokenResponse(
            accessToken.value(),
            rawRefreshToken,
            "Bearer",
            accessToken.expiresAt()
                .getEpochSecond()
                - now.getEpochSecond()
        );
    }
}
