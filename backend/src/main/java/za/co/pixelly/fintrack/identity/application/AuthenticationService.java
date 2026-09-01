package za.co.pixelly.fintrack.identity.application;

import za.co.pixelly.fintrack.identity.api.LoginRequest;
import za.co.pixelly.fintrack.identity.api.RefreshRequest;
import za.co.pixelly.fintrack.identity.api.TokenResponse;

import java.util.UUID;

public interface AuthenticationService {

    public TokenResponse login(LoginRequest request, String userAgent);

    public TokenResponse refresh(RefreshRequest request);

    public void logout(UUID userId, UUID sessionId);
}
